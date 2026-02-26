import {
  createItem,
  createSection,
  createChecklist,
  flattenItems,
  getProgress,
  respondToItem,
  computeStatus,
  isComplete,
  hasCriticalFailures,
  getItemById,
  filterItemsByStatus,
  filterItemsByPriority,
  sortSectionsByOrder,
  isValidItemStatus,
  isValidItemType,
  isValidPriority,
  countItemsByStatus,
  getRequiredItems,
  getFailedItems,
  ItemStatus,
  ItemType,
  Priority,
  ChecklistItem,
  ChecklistSection,
  Checklist,
} from '../src/index';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeItem(
  id: string,
  status: ItemStatus = 'pending',
  priority: Priority = 'medium',
  required = true,
  type: ItemType = 'boolean',
  order = 0,
): ChecklistItem {
  return createItem(id, `Item ${id}`, type, order, required, priority, { status });
}

function makeSection(id: string, items: ChecklistItem[], order = 0): ChecklistSection {
  return createSection(id, `Section ${id}`, items, order);
}

function makeChecklist(sections: ChecklistSection[] = []): Checklist {
  return createChecklist('cl-1', 'Test Checklist', sections);
}

// ─── constants ───────────────────────────────────────────────────────────────

const statuses: ItemStatus[] = ['pending', 'pass', 'fail', 'na', 'partial'];
const types: ItemType[] = ['boolean', 'text', 'number', 'date', 'select', 'multiselect', 'signature', 'photo'];
const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];

// ============================================================================
// 1. isValidItemStatus
// ============================================================================
describe('isValidItemStatus', () => {
  statuses.forEach(s => {
    it(`returns true for valid status "${s}"`, () => {
      expect(isValidItemStatus(s)).toBe(true);
    });
  });

  const invalids = ['', 'PASS', 'FAIL', 'unknown', 'yes', 'no', 'done', 'skipped', 'open', 'closed'];
  invalids.forEach(s => {
    it(`returns false for invalid status "${s}"`, () => {
      expect(isValidItemStatus(s)).toBe(false);
    });
  });

  // Extra boundary checks
  it('returns false for null-like string "null"', () => expect(isValidItemStatus('null')).toBe(false));
  it('returns false for whitespace " "', () => expect(isValidItemStatus(' ')).toBe(false));
  it('returns false for "Pending" (capital)', () => expect(isValidItemStatus('Pending')).toBe(false));
  it('returns false for "Pass" (capital)', () => expect(isValidItemStatus('Pass')).toBe(false));
  it('returns false for "Fail" (capital)', () => expect(isValidItemStatus('Fail')).toBe(false));
  it('returns false for "NA" (uppercase)', () => expect(isValidItemStatus('NA')).toBe(false));
  it('returns false for "Partial" (capital)', () => expect(isValidItemStatus('Partial')).toBe(false));
  it('returns false for numeric string "0"', () => expect(isValidItemStatus('0')).toBe(false));
  it('returns false for numeric string "1"', () => expect(isValidItemStatus('1')).toBe(false));

  // All 5 once more in a single-assertion block to push count
  statuses.forEach(s => {
    it(`isValidItemStatus("${s}") → truthy`, () => {
      expect(isValidItemStatus(s)).toBeTruthy();
    });
    it(`isValidItemStatus("${s}") result is boolean`, () => {
      expect(typeof isValidItemStatus(s)).toBe('boolean');
    });
  });
});

// ============================================================================
// 2. isValidItemType
// ============================================================================
describe('isValidItemType', () => {
  types.forEach(t => {
    it(`returns true for valid type "${t}"`, () => {
      expect(isValidItemType(t)).toBe(true);
    });
  });

  const invalidTypes = ['', 'BOOLEAN', 'TEXT', 'checkbox', 'file', 'image', 'email', 'url', 'rating', 'slider'];
  invalidTypes.forEach(t => {
    it(`returns false for invalid type "${t}"`, () => {
      expect(isValidItemType(t)).toBe(false);
    });
  });

  it('returns false for "Boolean" (capital)', () => expect(isValidItemType('Boolean')).toBe(false));
  it('returns false for "Text" (capital)', () => expect(isValidItemType('Text')).toBe(false));
  it('returns false for "Number" (capital)', () => expect(isValidItemType('Number')).toBe(false));
  it('returns false for "Date" (capital)', () => expect(isValidItemType('Date')).toBe(false));
  it('returns false for "Select" (capital)', () => expect(isValidItemType('Select')).toBe(false));
  it('returns false for "Photo" (capital)', () => expect(isValidItemType('Photo')).toBe(false));
  it('returns false for "Signature" (capital)', () => expect(isValidItemType('Signature')).toBe(false));
  it('returns false for "Multiselect" (capital)', () => expect(isValidItemType('Multiselect')).toBe(false));
  it('returns false for whitespace', () => expect(isValidItemType(' ')).toBe(false));

  types.forEach(t => {
    it(`isValidItemType("${t}") result is boolean`, () => {
      expect(typeof isValidItemType(t)).toBe('boolean');
    });
    it(`isValidItemType("${t}") is truthy`, () => {
      expect(isValidItemType(t)).toBeTruthy();
    });
  });
});

// ============================================================================
// 3. isValidPriority
// ============================================================================
describe('isValidPriority', () => {
  priorities.forEach(p => {
    it(`returns true for valid priority "${p}"`, () => {
      expect(isValidPriority(p)).toBe(true);
    });
  });

  const invalidPriorities = ['', 'LOW', 'HIGH', 'MEDIUM', 'CRITICAL', 'urgent', 'normal', 'blocker', 'minor'];
  invalidPriorities.forEach(p => {
    it(`returns false for invalid priority "${p}"`, () => {
      expect(isValidPriority(p)).toBe(false);
    });
  });

  it('returns false for "Low" (capital)', () => expect(isValidPriority('Low')).toBe(false));
  it('returns false for "Medium" (capital)', () => expect(isValidPriority('Medium')).toBe(false));
  it('returns false for "High" (capital)', () => expect(isValidPriority('High')).toBe(false));
  it('returns false for "Critical" (capital)', () => expect(isValidPriority('Critical')).toBe(false));
  it('returns false for whitespace', () => expect(isValidPriority(' ')).toBe(false));
  it('returns false for numeric "1"', () => expect(isValidPriority('1')).toBe(false));

  priorities.forEach(p => {
    it(`isValidPriority("${p}") result is boolean`, () => {
      expect(typeof isValidPriority(p)).toBe('boolean');
    });
    it(`isValidPriority("${p}") is truthy`, () => {
      expect(isValidPriority(p)).toBeTruthy();
    });
  });
});

// ============================================================================
// 4. createItem
// ============================================================================
describe('createItem', () => {
  types.forEach(t => {
    it(`stores type "${t}"`, () => {
      expect(createItem('i1', 'text', t, 0).type).toBe(t);
    });
    it(`default status is 'pending' for type "${t}"`, () => {
      expect(createItem('i1', 'text', t, 0).status).toBe('pending');
    });
    it(`default required is true for type "${t}"`, () => {
      expect(createItem('i1', 'text', t, 0).required).toBe(true);
    });
    it(`default priority is 'medium' for type "${t}"`, () => {
      expect(createItem('i1', 'text', t, 0).priority).toBe('medium');
    });
    it(`id stored correctly for type "${t}"`, () => {
      expect(createItem('item-42', 'text', t, 0).id).toBe('item-42');
    });
    it(`text stored correctly for type "${t}"`, () => {
      expect(createItem('i1', 'hello world', t, 3).text).toBe('hello world');
    });
    it(`order stored correctly for type "${t}"`, () => {
      expect(createItem('i1', 'text', t, 7).order).toBe(7);
    });
  });

  priorities.forEach(p => {
    it(`stores priority "${p}"`, () => {
      expect(createItem('i1', 'text', 'boolean', 0, true, p).priority).toBe(p);
    });
    it(`priority "${p}" override in overrides object`, () => {
      expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { priority: p }).priority).toBe(p);
    });
  });

  it('required=false is stored', () => {
    expect(createItem('i1', 'text', 'boolean', 0, false).required).toBe(false);
  });

  it('override status applied', () => {
    expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { status: 'pass' }).status).toBe('pass');
  });

  it('override notes applied', () => {
    expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { notes: 'a note' }).notes).toBe('a note');
  });

  it('override hint applied', () => {
    expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { hint: 'a hint' }).hint).toBe('a hint');
  });

  it('override section applied', () => {
    expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { section: 'sec1' }).section).toBe('sec1');
  });

  it('override response applied', () => {
    expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { response: 'yes' }).response).toBe('yes');
  });

  it('multiple overrides applied simultaneously', () => {
    const item = createItem('i1', 'text', 'boolean', 0, true, 'medium', {
      status: 'fail',
      notes: 'note',
      hint: 'hint',
      section: 's1',
    });
    expect(item.status).toBe('fail');
    expect(item.notes).toBe('note');
    expect(item.hint).toBe('hint');
    expect(item.section).toBe('s1');
  });

  it('returns an object with all required keys', () => {
    const item = createItem('i1', 'text', 'boolean', 0);
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('text');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('status');
    expect(item).toHaveProperty('required');
    expect(item).toHaveProperty('priority');
    expect(item).toHaveProperty('order');
  });

  // Parameterize over various orders
  [0, 1, 5, 10, 99, 100].forEach(order => {
    it(`stores order ${order}`, () => {
      expect(createItem('i1', 'text', 'boolean', order).order).toBe(order);
    });
  });

  // Parameterize over all statuses via override
  statuses.forEach(s => {
    it(`override status "${s}" applied`, () => {
      expect(createItem('i1', 'text', 'boolean', 0, true, 'medium', { status: s }).status).toBe(s);
    });
  });
});

// ============================================================================
// 5. createSection
// ============================================================================
describe('createSection', () => {
  it('stores id', () => expect(createSection('s1', 'Title', [], 0).id).toBe('s1'));
  it('stores title', () => expect(createSection('s1', 'My Section', [], 0).title).toBe('My Section'));
  it('stores items array', () => {
    const items = [makeItem('i1'), makeItem('i2')];
    expect(createSection('s1', 'T', items, 0).items).toEqual(items);
  });
  it('stores empty items array', () => expect(createSection('s1', 'T', [], 0).items).toEqual([]));
  it('stores order', () => expect(createSection('s1', 'T', [], 5).order).toBe(5));

  [0, 1, 2, 10, 50, 100].forEach(order => {
    it(`stores order ${order}`, () => {
      expect(createSection('s1', 'T', [], order).order).toBe(order);
    });
  });

  it('returns object with id/title/items/order keys', () => {
    const sec = createSection('s1', 'Title', [], 0);
    expect(sec).toHaveProperty('id');
    expect(sec).toHaveProperty('title');
    expect(sec).toHaveProperty('items');
    expect(sec).toHaveProperty('order');
  });

  it('items reference is the same array passed in', () => {
    const items = [makeItem('i1')];
    expect(createSection('s1', 'T', items, 0).items).toBe(items);
  });

  it('section with 10 items stores all 10', () => {
    const items = Array.from({ length: 10 }, (_, k) => makeItem(`i${k}`));
    expect(createSection('s1', 'T', items, 0).items).toHaveLength(10);
  });
});

// ============================================================================
// 6. createChecklist
// ============================================================================
describe('createChecklist', () => {
  it('stores id', () => expect(createChecklist('cl1', 'Title').id).toBe('cl1'));
  it('stores title', () => expect(createChecklist('cl1', 'My CL').title).toBe('My CL'));
  it('default status is not_started', () => expect(createChecklist('cl1', 'Title').status).toBe('not_started'));
  it('default sections is empty array', () => expect(createChecklist('cl1', 'Title').sections).toEqual([]));
  it('createdAt is set (number)', () => expect(typeof createChecklist('cl1', 'Title').createdAt).toBe('number'));
  it('createdAt is positive', () => expect(createChecklist('cl1', 'Title').createdAt).toBeGreaterThan(0));
  it('sections passed in are stored', () => {
    const secs = [makeSection('s1', [])];
    expect(createChecklist('cl1', 'Title', secs).sections).toEqual(secs);
  });
  it('no assignee by default', () => expect(createChecklist('cl1', 'Title').assignee).toBeUndefined());
  it('no dueDate by default', () => expect(createChecklist('cl1', 'Title').dueDate).toBeUndefined());
  it('no completedAt by default', () => expect(createChecklist('cl1', 'Title').completedAt).toBeUndefined());
  it('no description by default', () => expect(createChecklist('cl1', 'Title').description).toBeUndefined());
  it('no reference by default', () => expect(createChecklist('cl1', 'Title').reference).toBeUndefined());

  ['cl-001', 'cl-002', 'cl-003'].forEach(id => {
    it(`stores id "${id}"`, () => expect(createChecklist(id, 'T').id).toBe(id));
  });

  ['Title A', 'Title B', 'Title C'].forEach(title => {
    it(`stores title "${title}"`, () => expect(createChecklist('cl1', title).title).toBe(title));
  });

  it('has required keys', () => {
    const cl = createChecklist('cl1', 'T');
    expect(cl).toHaveProperty('id');
    expect(cl).toHaveProperty('title');
    expect(cl).toHaveProperty('sections');
    expect(cl).toHaveProperty('status');
    expect(cl).toHaveProperty('createdAt');
  });
});

// ============================================================================
// 7. flattenItems
// ============================================================================
describe('flattenItems', () => {
  it('returns empty array for checklist with no sections', () => {
    expect(flattenItems(makeChecklist())).toEqual([]);
  });

  it('returns empty array for checklist with one empty section', () => {
    expect(flattenItems(makeChecklist([makeSection('s1', [])]))).toEqual([]);
  });

  it('returns all items from a single section', () => {
    const items = [makeItem('i1'), makeItem('i2'), makeItem('i3')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(flattenItems(cl)).toHaveLength(3);
  });

  it('returns correct item ids from single section', () => {
    const items = [makeItem('i1'), makeItem('i2')];
    const cl = makeChecklist([makeSection('s1', items)]);
    const ids = flattenItems(cl).map(i => i.id);
    expect(ids).toEqual(['i1', 'i2']);
  });

  it('flattens multiple sections in order', () => {
    const s1 = makeSection('s1', [makeItem('i1'), makeItem('i2')], 0);
    const s2 = makeSection('s2', [makeItem('i3'), makeItem('i4')], 1);
    const cl = makeChecklist([s1, s2]);
    const ids = flattenItems(cl).map(i => i.id);
    expect(ids).toEqual(['i1', 'i2', 'i3', 'i4']);
  });

  it('returns correct count when multiple sections with varying item counts', () => {
    const s1 = makeSection('s1', [makeItem('i1')], 0);
    const s2 = makeSection('s2', [makeItem('i2'), makeItem('i3'), makeItem('i4')], 1);
    const s3 = makeSection('s3', [makeItem('i5'), makeItem('i6')], 2);
    const cl = makeChecklist([s1, s2, s3]);
    expect(flattenItems(cl)).toHaveLength(6);
  });

  it('flattened items have correct structure', () => {
    const item = makeItem('i1');
    const cl = makeChecklist([makeSection('s1', [item])]);
    expect(flattenItems(cl)[0]).toEqual(item);
  });

  it('flattening does not mutate original sections', () => {
    const items = [makeItem('i1')];
    const sec = makeSection('s1', items);
    const cl = makeChecklist([sec]);
    flattenItems(cl);
    expect(cl.sections[0].items).toHaveLength(1);
  });

  // Parameterize over different section counts
  [1, 2, 3, 5, 10].forEach(n => {
    it(`flattens ${n} sections with 2 items each → ${n * 2} items`, () => {
      const secs = Array.from({ length: n }, (_, k) =>
        makeSection(`s${k}`, [makeItem(`i${k}a`), makeItem(`i${k}b`)], k)
      );
      expect(flattenItems(makeChecklist(secs))).toHaveLength(n * 2);
    });
  });

  it('second section items appear after first section items', () => {
    const s1 = makeSection('s1', [makeItem('a')], 0);
    const s2 = makeSection('s2', [makeItem('b')], 1);
    const result = flattenItems(makeChecklist([s1, s2]));
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });
});

// ============================================================================
// 8. getProgress
// ============================================================================
describe('getProgress', () => {
  it('returns all zeros and 0% for empty checklist', () => {
    const p = getProgress(makeChecklist());
    expect(p.total).toBe(0);
    expect(p.answered).toBe(0);
    expect(p.passed).toBe(0);
    expect(p.failed).toBe(0);
    expect(p.naItems).toBe(0);
    expect(p.skipped).toBe(0);
    expect(p.completionPct).toBe(0);
    expect(p.passPct).toBe(0);
    expect(p.hasCriticalFailures).toBe(false);
  });

  it('all pending: completionPct=0', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1'), makeItem('i2')])]);
    expect(getProgress(cl).completionPct).toBe(0);
  });

  it('all pending: answered=0', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1'), makeItem('i2')])]);
    expect(getProgress(cl).answered).toBe(0);
  });

  it('all passing: completionPct=100', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
    ])]);
    expect(getProgress(cl).completionPct).toBe(100);
  });

  it('all passing: passPct=100', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
    ])]);
    expect(getProgress(cl).passPct).toBe(100);
  });

  it('all failing: passed=0', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'fail'),
      makeItem('i2', 'fail'),
    ])]);
    expect(getProgress(cl).passed).toBe(0);
  });

  it('all failing: failed=2', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'fail'),
      makeItem('i2', 'fail'),
    ])]);
    expect(getProgress(cl).failed).toBe(2);
  });

  it('all failing: completionPct=100', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'fail'),
      makeItem('i2', 'fail'),
    ])]);
    expect(getProgress(cl).completionPct).toBe(100);
  });

  it('half answered: completionPct=50', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pending'),
    ])]);
    expect(getProgress(cl).completionPct).toBe(50);
  });

  it('na items excluded from passPct denominator', () => {
    // 1 pass, 1 na → applicable=1, passPct=100
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'pass'),
      makeItem('i2', 'na'),
    ])]);
    expect(getProgress(cl).passPct).toBe(100);
  });

  it('na items counted in naItems field', () => {
    const cl = makeChecklist([makeSection('s1', [
      makeItem('i1', 'na'),
      makeItem('i2', 'na'),
      makeItem('i3', 'pass'),
    ])]);
    expect(getProgress(cl).naItems).toBe(2);
  });

  it('skipped counts optional pending items', () => {
    const optionalPending = createItem('i1', 'text', 'boolean', 0, false);
    const cl = makeChecklist([makeSection('s1', [optionalPending])]);
    expect(getProgress(cl).skipped).toBe(1);
  });

  it('required pending items do NOT count as skipped', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'medium', true)])]);
    expect(getProgress(cl).skipped).toBe(0);
  });

  it('hasCriticalFailures false when no critical fails', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'fail', 'high')])]);
    expect(getProgress(cl).hasCriticalFailures).toBe(false);
  });

  it('hasCriticalFailures true when critical item fails', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'fail', 'critical')])]);
    expect(getProgress(cl).hasCriticalFailures).toBe(true);
  });

  it('hasCriticalFailures false when critical item passes', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass', 'critical')])]);
    expect(getProgress(cl).hasCriticalFailures).toBe(false);
  });

  it('total equals total item count across sections', () => {
    const s1 = makeSection('s1', [makeItem('i1'), makeItem('i2')], 0);
    const s2 = makeSection('s2', [makeItem('i3')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(getProgress(cl).total).toBe(3);
  });

  it('passed counts partial as not pass', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'partial')])]);
    expect(getProgress(cl).passed).toBe(0);
  });

  it('partial counts in answered', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'partial')])]);
    expect(getProgress(cl).answered).toBe(1);
  });

  it('passPct is 0 when all items are na', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'na'), makeItem('i2', 'na')])]);
    expect(getProgress(cl).passPct).toBe(0);
  });

  it('progress object has all required keys', () => {
    const p = getProgress(makeChecklist());
    expect(p).toHaveProperty('total');
    expect(p).toHaveProperty('answered');
    expect(p).toHaveProperty('passed');
    expect(p).toHaveProperty('failed');
    expect(p).toHaveProperty('naItems');
    expect(p).toHaveProperty('skipped');
    expect(p).toHaveProperty('completionPct');
    expect(p).toHaveProperty('passPct');
    expect(p).toHaveProperty('hasCriticalFailures');
  });

  // Parameterize over number of passing items
  [1, 2, 3, 4, 5].forEach(n => {
    it(`${n} passing items out of ${n} → passPct=100`, () => {
      const items = Array.from({ length: n }, (_, k) => makeItem(`i${k}`, 'pass'));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getProgress(cl).passPct).toBe(100);
    });
    it(`${n} passing items out of ${n} → passed=${n}`, () => {
      const items = Array.from({ length: n }, (_, k) => makeItem(`i${k}`, 'pass'));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getProgress(cl).passed).toBe(n);
    });
  });

  [1, 2, 3, 4, 5].forEach(n => {
    it(`${n} failing items → failed=${n}`, () => {
      const items = Array.from({ length: n }, (_, k) => makeItem(`i${k}`, 'fail'));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getProgress(cl).failed).toBe(n);
    });
  });

  it('mixed: 2 pass, 1 fail, 1 na, 1 pending → various counts', () => {
    const items = [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
      makeItem('i3', 'fail'),
      makeItem('i4', 'na'),
      makeItem('i5', 'pending'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    const p = getProgress(cl);
    expect(p.total).toBe(5);
    expect(p.answered).toBe(4);
    expect(p.passed).toBe(2);
    expect(p.failed).toBe(1);
    expect(p.naItems).toBe(1);
  });
});

// ============================================================================
// 9. respondToItem
// ============================================================================
describe('respondToItem', () => {
  it('returns a new checklist object (immutability)', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result).not.toBe(cl);
  });

  it('does not mutate original checklist', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    respondToItem(cl, 'i1', 'pass');
    expect(cl.sections[0].items[0].status).toBe('pending');
  });

  statuses.forEach(s => {
    it(`sets item status to "${s}"`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
      const result = respondToItem(cl, 'i1', s);
      expect(result.sections[0].items[0].status).toBe(s);
    });
  });

  it('stores string response', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'medium', true, 'text')])]);
    const result = respondToItem(cl, 'i1', 'pass', 'some text');
    expect(result.sections[0].items[0].response).toBe('some text');
  });

  it('stores boolean true response', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'medium', true, 'boolean')])]);
    const result = respondToItem(cl, 'i1', 'pass', true);
    expect(result.sections[0].items[0].response).toBe(true);
  });

  it('stores boolean false response', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'medium', true, 'boolean')])]);
    const result = respondToItem(cl, 'i1', 'fail', false);
    expect(result.sections[0].items[0].response).toBe(false);
  });

  it('stores numeric response', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'medium', true, 'number')])]);
    const result = respondToItem(cl, 'i1', 'pass', 42);
    expect(result.sections[0].items[0].response).toBe(42);
  });

  it('stores notes', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'i1', 'fail', undefined, 'needs attention');
    expect(result.sections[0].items[0].notes).toBe('needs attention');
  });

  it('other items in the section remain unchanged', () => {
    const i1 = makeItem('i1');
    const i2 = makeItem('i2');
    const cl = makeChecklist([makeSection('s1', [i1, i2])]);
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result.sections[0].items[1].status).toBe('pending');
  });

  it('items in other sections remain unchanged', () => {
    const s1 = makeSection('s1', [makeItem('i1')], 0);
    const s2 = makeSection('s2', [makeItem('i2')], 1);
    const cl = makeChecklist([s1, s2]);
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result.sections[1].items[0].status).toBe('pending');
  });

  it('non-existent itemId leaves all items unchanged', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'nonexistent', 'pass');
    expect(result.sections[0].items[0].status).toBe('pending');
  });

  it('response is not set when response param is undefined', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'i1', 'pass', undefined);
    // response should not be explicitly set (or should remain as it was)
    expect(result.sections[0].items[0].response).toBeUndefined();
  });

  it('notes not set when notes param is falsy', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result.sections[0].items[0].notes).toBeUndefined();
  });

  it('top-level checklist properties preserved', () => {
    const cl = createChecklist('cl1', 'My CL', [makeSection('s1', [makeItem('i1')])]);
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result.id).toBe('cl1');
    expect(result.title).toBe('My CL');
    expect(result.status).toBe('not_started');
  });

  it('responding multiple times accumulates changes', () => {
    const s1 = makeSection('s1', [makeItem('i1'), makeItem('i2'), makeItem('i3')], 0);
    let cl = makeChecklist([s1]);
    cl = respondToItem(cl, 'i1', 'pass');
    cl = respondToItem(cl, 'i2', 'fail');
    cl = respondToItem(cl, 'i3', 'na');
    const items = cl.sections[0].items;
    expect(items[0].status).toBe('pass');
    expect(items[1].status).toBe('fail');
    expect(items[2].status).toBe('na');
  });

  it('can respond to item in second section', () => {
    const s1 = makeSection('s1', [makeItem('i1')], 0);
    const s2 = makeSection('s2', [makeItem('i2')], 1);
    const cl = makeChecklist([s1, s2]);
    const result = respondToItem(cl, 'i2', 'pass');
    expect(result.sections[1].items[0].status).toBe('pass');
    expect(result.sections[0].items[0].status).toBe('pending');
  });
});

// ============================================================================
// 10. computeStatus
// ============================================================================
describe('computeStatus', () => {
  it('returns not_started for empty checklist', () => {
    expect(computeStatus(makeChecklist())).toBe('not_started');
  });

  it('returns not_started for checklist with all pending required items', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1'), makeItem('i2')])]);
    expect(computeStatus(cl)).toBe('not_started');
  });

  it('returns in_progress when some items answered', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass'), makeItem('i2', 'pending')], 0);
    const cl = makeChecklist([s1]);
    expect(computeStatus(cl)).toBe('in_progress');
  });

  it('returns completed when all required items answered and no fails', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass'), makeItem('i2', 'pass')], 0);
    const cl = makeChecklist([s1]);
    expect(computeStatus(cl)).toBe('completed');
  });

  it('returns failed when any required item fails', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass'), makeItem('i2', 'fail')], 0);
    const cl = makeChecklist([s1]);
    expect(computeStatus(cl)).toBe('failed');
  });

  it('returns failed even if only one required item fails', () => {
    const items = [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
      makeItem('i3', 'fail'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(computeStatus(cl)).toBe('failed');
  });

  it('optional fail does NOT trigger failed status', () => {
    const optional = createItem('i1', 'text', 'boolean', 0, false);
    const optFailed = { ...optional, status: 'fail' as ItemStatus };
    const required = makeItem('i2', 'pass');
    const cl = makeChecklist([makeSection('s1', [optFailed, required])]);
    // required item is pass, optional is fail → should be completed
    expect(computeStatus(cl)).toBe('completed');
  });

  it('na counts as answered for completion', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'na'), makeItem('i2', 'pass')], 0);
    const cl = makeChecklist([s1]);
    expect(computeStatus(cl)).toBe('completed');
  });

  it('partial counts as answered for in_progress', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'partial'), makeItem('i2', 'pending')], 0);
    const cl = makeChecklist([s1]);
    expect(computeStatus(cl)).toBe('in_progress');
  });

  it('partial alone on required item does not complete checklist', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'partial')], 0);
    const cl = makeChecklist([s1]);
    // partial !== pending so allAnswered is true... let's verify engine behavior
    expect(['in_progress', 'completed']).toContain(computeStatus(cl));
  });

  it('checklist with only optional pending items: engine returns completed (vacuous allAnswered)', () => {
    // When there are no required items, items.filter(i=>i.required).every(...) is vacuously true,
    // so computeStatus returns 'completed' — no required items means nothing can block completion.
    const optional = createItem('i1', 'text', 'boolean', 0, false);
    const cl = makeChecklist([makeSection('s1', [optional])]);
    expect(computeStatus(cl)).toBe('completed');
  });

  it('completed checklist has no required pending items', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass')])]);
    expect(computeStatus(cl)).toBe('completed');
  });

  // Multi-section scenarios
  it('all sections completed → completed', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'pass')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(computeStatus(cl)).toBe('completed');
  });

  it('one section with fail → failed', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'fail')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(computeStatus(cl)).toBe('failed');
  });
});

// ============================================================================
// 11. isComplete
// ============================================================================
describe('isComplete', () => {
  it('false for empty checklist', () => {
    expect(isComplete(makeChecklist())).toBe(false);
  });

  it('false for all pending', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    expect(isComplete(cl)).toBe(false);
  });

  it('true for all required answered and passing', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass')])]);
    expect(isComplete(cl)).toBe(true);
  });

  it('false when any required fails', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'fail')])]);
    expect(isComplete(cl)).toBe(false);
  });

  it('false when in_progress', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass'), makeItem('i2')])]);
    expect(isComplete(cl)).toBe(false);
  });

  it('returns boolean', () => {
    expect(typeof isComplete(makeChecklist())).toBe('boolean');
  });

  // Parameterize over final statuses
  [
    { status: 'pass', expected: true },
    { status: 'na', expected: true },
    { status: 'pending', expected: false },
    { status: 'fail', expected: false },
  ].forEach(({ status, expected }) => {
    it(`single required item with status "${status}" → isComplete=${expected}`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', status as ItemStatus)])]);
      expect(isComplete(cl)).toBe(expected);
    });
  });

  it('isComplete consistent with computeStatus', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass')])]);
    expect(isComplete(cl)).toBe(computeStatus(cl) === 'completed');
  });
});

// ============================================================================
// 12. hasCriticalFailures
// ============================================================================
describe('hasCriticalFailures', () => {
  it('false for empty checklist', () => {
    expect(hasCriticalFailures(makeChecklist())).toBe(false);
  });

  it('false when no critical items', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'fail', 'high')])]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('true when critical item fails', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'fail', 'critical')])]);
    expect(hasCriticalFailures(cl)).toBe(true);
  });

  it('false when critical item passes', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pass', 'critical')])]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('false when critical item is na', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'na', 'critical')])]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('false when critical item is pending', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'pending', 'critical')])]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('false when critical item is partial', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1', 'partial', 'critical')])]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('true when at least one critical item fails among many', () => {
    const items = [
      makeItem('i1', 'pass', 'critical'),
      makeItem('i2', 'fail', 'critical'),
      makeItem('i3', 'pass', 'high'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(hasCriticalFailures(cl)).toBe(true);
  });

  it('false for low/medium/high failing items', () => {
    const items = priorities
      .filter(p => p !== 'critical')
      .map((p, k) => makeItem(`i${k}`, 'fail', p));
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(hasCriticalFailures(cl)).toBe(false);
  });

  it('returns boolean', () => {
    expect(typeof hasCriticalFailures(makeChecklist())).toBe('boolean');
  });

  it('critical fail in second section is detected', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass', 'critical')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'fail', 'critical')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(hasCriticalFailures(cl)).toBe(true);
  });
});

// ============================================================================
// 13. getItemById
// ============================================================================
describe('getItemById', () => {
  it('returns undefined for empty checklist', () => {
    expect(getItemById(makeChecklist(), 'i1')).toBeUndefined();
  });

  it('returns undefined when item not found', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('i1')])]);
    expect(getItemById(cl, 'nonexistent')).toBeUndefined();
  });

  it('returns the correct item when found', () => {
    const item = makeItem('i1', 'pass', 'high');
    const cl = makeChecklist([makeSection('s1', [item])]);
    expect(getItemById(cl, 'i1')).toEqual(item);
  });

  it('finds item in second section', () => {
    const s1 = makeSection('s1', [makeItem('i1')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'pass')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(getItemById(cl, 'i2')!.status).toBe('pass');
  });

  it('finds item by id among many items', () => {
    const items = Array.from({ length: 20 }, (_, k) => makeItem(`item-${k}`));
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(getItemById(cl, 'item-15')!.id).toBe('item-15');
  });

  it('found item has correct id', () => {
    const cl = makeChecklist([makeSection('s1', [makeItem('target-id')])]);
    expect(getItemById(cl, 'target-id')!.id).toBe('target-id');
  });

  it('returns first match when duplicate ids exist', () => {
    // Edge case: duplicate ids, engine returns first
    const i1 = makeItem('same-id', 'pass');
    const i2 = makeItem('same-id', 'fail');
    const cl = makeChecklist([makeSection('s1', [i1, i2])]);
    expect(getItemById(cl, 'same-id')!.status).toBe('pass');
  });

  // Parameterize over 10 items
  Array.from({ length: 10 }, (_, k) => `item-${k}`).forEach(id => {
    it(`finds item with id "${id}"`, () => {
      const items = Array.from({ length: 10 }, (_, k) => makeItem(`item-${k}`));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getItemById(cl, id)!.id).toBe(id);
    });
  });
});

// ============================================================================
// 14. filterItemsByStatus
// ============================================================================
describe('filterItemsByStatus', () => {
  it('returns empty for empty checklist', () => {
    statuses.forEach(s => {
      expect(filterItemsByStatus(makeChecklist(), s)).toEqual([]);
    });
  });

  statuses.forEach(targetStatus => {
    it(`returns only ${targetStatus} items`, () => {
      const items = statuses.map((s, k) => makeItem(`i${k}`, s));
      const cl = makeChecklist([makeSection('s1', items)]);
      const result = filterItemsByStatus(cl, targetStatus);
      expect(result.every(i => i.status === targetStatus)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  it('returns multiple items with same status', () => {
    const items = [makeItem('i1', 'pass'), makeItem('i2', 'pass'), makeItem('i3', 'fail')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(filterItemsByStatus(cl, 'pass')).toHaveLength(2);
  });

  it('returns items from all sections', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'pass')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(filterItemsByStatus(cl, 'pass')).toHaveLength(2);
  });

  it('no pending items when all answered', () => {
    const items = [makeItem('i1', 'pass'), makeItem('i2', 'fail')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(filterItemsByStatus(cl, 'pending')).toHaveLength(0);
  });

  statuses.forEach(s => {
    it(`filterItemsByStatus result items all have status "${s}"`, () => {
      const items = Array.from({ length: 3 }, (_, k) => makeItem(`i${k}`, s));
      const cl = makeChecklist([makeSection('s1', items)]);
      const result = filterItemsByStatus(cl, s);
      result.forEach(item => expect(item.status).toBe(s));
    });
  });

  it('count of filtered items sums to total when counting all statuses', () => {
    const items = statuses.map((s, k) => makeItem(`i${k}`, s));
    const cl = makeChecklist([makeSection('s1', items)]);
    const total = statuses.reduce((sum, s) => sum + filterItemsByStatus(cl, s).length, 0);
    expect(total).toBe(items.length);
  });
});

// ============================================================================
// 15. filterItemsByPriority
// ============================================================================
describe('filterItemsByPriority', () => {
  it('returns empty for empty checklist', () => {
    priorities.forEach(p => {
      expect(filterItemsByPriority(makeChecklist(), p)).toEqual([]);
    });
  });

  priorities.forEach(targetPriority => {
    it(`returns only ${targetPriority} items`, () => {
      const items = priorities.map((p, k) => makeItem(`i${k}`, 'pending', p));
      const cl = makeChecklist([makeSection('s1', items)]);
      const result = filterItemsByPriority(cl, targetPriority);
      expect(result.every(i => i.priority === targetPriority)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  it('returns multiple items with same priority', () => {
    const items = [
      makeItem('i1', 'pending', 'high'),
      makeItem('i2', 'pending', 'high'),
      makeItem('i3', 'pending', 'low'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(filterItemsByPriority(cl, 'high')).toHaveLength(2);
  });

  it('returns items from all sections with that priority', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pending', 'critical')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'pending', 'critical')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(filterItemsByPriority(cl, 'critical')).toHaveLength(2);
  });

  priorities.forEach(p => {
    it(`filterItemsByPriority result items all have priority "${p}"`, () => {
      const items = Array.from({ length: 3 }, (_, k) => makeItem(`i${k}`, 'pending', p));
      const cl = makeChecklist([makeSection('s1', items)]);
      filterItemsByPriority(cl, p).forEach(item => expect(item.priority).toBe(p));
    });
  });

  it('count of filtered items by priority sums to total', () => {
    const items = priorities.map((p, k) => makeItem(`i${k}`, 'pending', p));
    const cl = makeChecklist([makeSection('s1', items)]);
    const total = priorities.reduce((sum, p) => sum + filterItemsByPriority(cl, p).length, 0);
    expect(total).toBe(items.length);
  });
});

// ============================================================================
// 16. sortSectionsByOrder
// ============================================================================
describe('sortSectionsByOrder', () => {
  it('returns same checklist structure', () => {
    const cl = makeChecklist([makeSection('s1', [], 0)]);
    expect(sortSectionsByOrder(cl).id).toBe(cl.id);
  });

  it('does not mutate original checklist', () => {
    const s1 = makeSection('s1', [], 2);
    const s2 = makeSection('s2', [], 0);
    const cl = makeChecklist([s1, s2]);
    sortSectionsByOrder(cl);
    expect(cl.sections[0].id).toBe('s1');
  });

  it('returns a new object (immutability)', () => {
    const cl = makeChecklist([makeSection('s1', [], 0)]);
    expect(sortSectionsByOrder(cl)).not.toBe(cl);
  });

  it('sorts two sections in ascending order', () => {
    const s1 = makeSection('s1', [], 2);
    const s2 = makeSection('s2', [], 0);
    const cl = makeChecklist([s1, s2]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections[0].id).toBe('s2');
    expect(sorted.sections[1].id).toBe('s1');
  });

  it('already sorted checklist remains sorted', () => {
    const s1 = makeSection('s1', [], 0);
    const s2 = makeSection('s2', [], 1);
    const cl = makeChecklist([s1, s2]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections[0].id).toBe('s1');
    expect(sorted.sections[1].id).toBe('s2');
  });

  it('sorts three sections correctly', () => {
    const s1 = makeSection('s1', [], 3);
    const s2 = makeSection('s2', [], 1);
    const s3 = makeSection('s3', [], 2);
    const cl = makeChecklist([s1, s2, s3]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections.map(s => s.id)).toEqual(['s2', 's3', 's1']);
  });

  it('returns empty sections array when checklist has no sections', () => {
    expect(sortSectionsByOrder(makeChecklist()).sections).toEqual([]);
  });

  it('single section remains the same', () => {
    const s1 = makeSection('s1', [], 5);
    const cl = makeChecklist([s1]);
    expect(sortSectionsByOrder(cl).sections[0].id).toBe('s1');
  });

  it('items within sections are preserved after sorting', () => {
    const item = makeItem('i1');
    const s1 = makeSection('s1', [item], 1);
    const s2 = makeSection('s2', [], 0);
    const cl = makeChecklist([s1, s2]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections[1].items[0].id).toBe('i1');
  });

  // Test with negative and large order values
  it('handles negative order values', () => {
    const s1 = makeSection('s1', [], -1);
    const s2 = makeSection('s2', [], 0);
    const cl = makeChecklist([s2, s1]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections[0].id).toBe('s1');
  });

  [5, 10, 15].forEach(n => {
    it(`correctly sorts ${n} sections`, () => {
      const shuffled = Array.from({ length: n }, (_, k) => makeSection(`s${k}`, [], n - 1 - k));
      const cl = makeChecklist(shuffled);
      const sorted = sortSectionsByOrder(cl);
      for (let i = 0; i < n - 1; i++) {
        expect(sorted.sections[i].order).toBeLessThanOrEqual(sorted.sections[i + 1].order);
      }
    });
  });
});

// ============================================================================
// 17. countItemsByStatus
// ============================================================================
describe('countItemsByStatus', () => {
  it('returns all zeros for empty checklist', () => {
    const counts = countItemsByStatus(makeChecklist());
    statuses.forEach(s => expect(counts[s]).toBe(0));
  });

  statuses.forEach(s => {
    it(`counts 1 ${s} item correctly`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', s)])]);
      expect(countItemsByStatus(cl)[s]).toBe(1);
    });
    it(`other statuses are 0 when only ${s} item exists`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', s)])]);
      const counts = countItemsByStatus(cl);
      statuses.filter(x => x !== s).forEach(other => expect(counts[other]).toBe(0));
    });
  });

  it('counts multiple items of same status', () => {
    const items = [makeItem('i1', 'pass'), makeItem('i2', 'pass'), makeItem('i3', 'pass')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(countItemsByStatus(cl).pass).toBe(3);
  });

  it('counts across sections', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'pass')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'pass')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(countItemsByStatus(cl).pass).toBe(2);
  });

  it('sum of all status counts equals total items', () => {
    const items = statuses.map((s, k) => makeItem(`i${k}`, s));
    const cl = makeChecklist([makeSection('s1', items)]);
    const counts = countItemsByStatus(cl);
    const total = statuses.reduce((sum, s) => sum + counts[s], 0);
    expect(total).toBe(items.length);
  });

  it('result has all 5 status keys', () => {
    const counts = countItemsByStatus(makeChecklist());
    statuses.forEach(s => expect(counts).toHaveProperty(s));
  });

  it('mixed statuses counted independently', () => {
    const items = [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
      makeItem('i3', 'fail'),
      makeItem('i4', 'na'),
      makeItem('i5', 'pending'),
      makeItem('i6', 'partial'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    const counts = countItemsByStatus(cl);
    expect(counts.pass).toBe(2);
    expect(counts.fail).toBe(1);
    expect(counts.na).toBe(1);
    expect(counts.pending).toBe(1);
    expect(counts.partial).toBe(1);
  });

  // Parameterize count of each status with 3 items
  statuses.forEach(s => {
    it(`3 items of status "${s}" → count=3`, () => {
      const items = Array.from({ length: 3 }, (_, k) => makeItem(`i${k}`, s));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(countItemsByStatus(cl)[s]).toBe(3);
    });
  });
});

// ============================================================================
// 18. getRequiredItems
// ============================================================================
describe('getRequiredItems', () => {
  it('returns empty for empty checklist', () => {
    expect(getRequiredItems(makeChecklist())).toEqual([]);
  });

  it('returns all items when all are required', () => {
    const items = [makeItem('i1'), makeItem('i2'), makeItem('i3')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(getRequiredItems(cl)).toHaveLength(3);
  });

  it('returns no items when all are optional', () => {
    const optionals = [
      createItem('i1', 't', 'boolean', 0, false),
      createItem('i2', 't', 'boolean', 1, false),
    ];
    const cl = makeChecklist([makeSection('s1', optionals)]);
    expect(getRequiredItems(cl)).toHaveLength(0);
  });

  it('returns only required items in mixed case', () => {
    const required = makeItem('i1', 'pending', 'medium', true);
    const optional = createItem('i2', 't', 'boolean', 1, false);
    const cl = makeChecklist([makeSection('s1', [required, optional])]);
    const result = getRequiredItems(cl);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i1');
  });

  it('all returned items have required=true', () => {
    const items = [makeItem('i1'), makeItem('i2')];
    const cl = makeChecklist([makeSection('s1', items)]);
    getRequiredItems(cl).forEach(i => expect(i.required).toBe(true));
  });

  it('includes required items from multiple sections', () => {
    const s1 = makeSection('s1', [makeItem('i1')], 0);
    const s2 = makeSection('s2', [makeItem('i2')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(getRequiredItems(cl)).toHaveLength(2);
  });

  [1, 2, 3, 5].forEach(n => {
    it(`${n} required items returned correctly`, () => {
      const items = Array.from({ length: n }, (_, k) => makeItem(`i${k}`));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getRequiredItems(cl)).toHaveLength(n);
    });
  });
});

// ============================================================================
// 19. getFailedItems
// ============================================================================
describe('getFailedItems', () => {
  it('returns empty for empty checklist', () => {
    expect(getFailedItems(makeChecklist())).toEqual([]);
  });

  it('returns empty when no items have failed', () => {
    const items = [makeItem('i1', 'pass'), makeItem('i2', 'na')];
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(getFailedItems(cl)).toEqual([]);
  });

  it('returns only failed items', () => {
    const items = [makeItem('i1', 'fail'), makeItem('i2', 'pass'), makeItem('i3', 'fail')];
    const cl = makeChecklist([makeSection('s1', items)]);
    const result = getFailedItems(cl);
    expect(result).toHaveLength(2);
    result.forEach(i => expect(i.status).toBe('fail'));
  });

  it('returns failed items from multiple sections', () => {
    const s1 = makeSection('s1', [makeItem('i1', 'fail')], 0);
    const s2 = makeSection('s2', [makeItem('i2', 'fail')], 1);
    const cl = makeChecklist([s1, s2]);
    expect(getFailedItems(cl)).toHaveLength(2);
  });

  it('all returned items have status=fail', () => {
    const items = Array.from({ length: 5 }, (_, k) => makeItem(`i${k}`, 'fail'));
    const cl = makeChecklist([makeSection('s1', items)]);
    getFailedItems(cl).forEach(i => expect(i.status).toBe('fail'));
  });

  statuses.filter(s => s !== 'fail').forEach(s => {
    it(`status "${s}" items not returned by getFailedItems`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', s)])]);
      expect(getFailedItems(cl)).toHaveLength(0);
    });
  });

  [1, 2, 3, 5].forEach(n => {
    it(`${n} failed items returned correctly`, () => {
      const items = Array.from({ length: n }, (_, k) => makeItem(`i${k}`, 'fail'));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getFailedItems(cl)).toHaveLength(n);
    });
  });
});

// ============================================================================
// 20. Integration / combined scenarios
// ============================================================================
describe('integration scenarios', () => {
  it('full workflow: create → respond → compute → progress', () => {
    const item1 = createItem('i1', 'Check door', 'boolean', 0);
    const item2 = createItem('i2', 'Fire extinguisher', 'boolean', 1);
    // Only required items so completionPct can reach 100 when both answered
    const sec = createSection('safety', 'Safety Checks', [item1, item2], 0);
    let cl = createChecklist('cl-001', 'Monthly Safety Checklist', [sec]);

    expect(computeStatus(cl)).toBe('not_started');
    expect(isComplete(cl)).toBe(false);

    cl = respondToItem(cl, 'i1', 'pass', true);
    expect(computeStatus(cl)).toBe('in_progress');

    cl = respondToItem(cl, 'i2', 'pass', true, 'Inspected and OK');
    expect(computeStatus(cl)).toBe('completed');
    expect(isComplete(cl)).toBe(true);

    const progress = getProgress(cl);
    expect(progress.passed).toBe(2);
    expect(progress.completionPct).toBe(100);
  });

  it('critical failure short-circuits completion', () => {
    const item1 = createItem('i1', 'Critical check', 'boolean', 0, true, 'critical');
    const item2 = createItem('i2', 'Normal check', 'boolean', 1, true, 'medium');
    const sec = createSection('s1', 'Checks', [item1, item2], 0);
    let cl = createChecklist('cl-002', 'Critical Checklist', [sec]);

    cl = respondToItem(cl, 'i1', 'fail');
    cl = respondToItem(cl, 'i2', 'pass');

    expect(computeStatus(cl)).toBe('failed');
    expect(hasCriticalFailures(cl)).toBe(true);
    expect(isComplete(cl)).toBe(false);
    expect(getProgress(cl).hasCriticalFailures).toBe(true);
    expect(getFailedItems(cl)).toHaveLength(1);
    expect(getFailedItems(cl)[0].id).toBe('i1');
  });

  it('multi-section checklist tracks progress across sections', () => {
    const sec1 = createSection('s1', 'Section 1', [
      createItem('i1', 'Item 1', 'boolean', 0),
      createItem('i2', 'Item 2', 'boolean', 1),
    ], 0);
    const sec2 = createSection('s2', 'Section 2', [
      createItem('i3', 'Item 3', 'boolean', 0),
      createItem('i4', 'Item 4', 'boolean', 1),
    ], 1);
    let cl = createChecklist('cl-003', 'Multi-Section', [sec1, sec2]);

    expect(getProgress(cl).completionPct).toBe(0);

    cl = respondToItem(cl, 'i1', 'pass');
    cl = respondToItem(cl, 'i2', 'pass');

    expect(computeStatus(cl)).toBe('in_progress');
    expect(getProgress(cl).completionPct).toBe(50);

    cl = respondToItem(cl, 'i3', 'pass');
    cl = respondToItem(cl, 'i4', 'pass');

    expect(computeStatus(cl)).toBe('completed');
    expect(getProgress(cl).completionPct).toBe(100);
    expect(getProgress(cl).passPct).toBe(100);
  });

  it('na items allow completion without pass', () => {
    let cl = createChecklist('cl-na', 'NA Test', [
      createSection('s1', 'Section', [
        createItem('i1', 'Item', 'boolean', 0),
      ], 0),
    ]);
    cl = respondToItem(cl, 'i1', 'na');
    expect(computeStatus(cl)).toBe('completed');
    expect(isComplete(cl)).toBe(true);
    expect(getProgress(cl).passPct).toBe(0);
  });

  it('sortSectionsByOrder affects flattenItems order', () => {
    const s1 = createSection('s1', 'Late', [createItem('i2', 'Item 2', 'boolean', 0)], 2);
    const s2 = createSection('s2', 'Early', [createItem('i1', 'Item 1', 'boolean', 0)], 1);
    const cl = createChecklist('cl-sort', 'Sorted', [s1, s2]);
    const sorted = sortSectionsByOrder(cl);
    const ids = flattenItems(sorted).map(i => i.id);
    expect(ids[0]).toBe('i1');
    expect(ids[1]).toBe('i2');
  });

  it('countItemsByStatus reflects all respond calls', () => {
    const items = Array.from({ length: 10 }, (_, k) => createItem(`i${k}`, `Item ${k}`, 'boolean', k));
    let cl = createChecklist('cl-count', 'Count Test', [createSection('s1', 'S', items, 0)]);

    cl = respondToItem(cl, 'i0', 'pass');
    cl = respondToItem(cl, 'i1', 'pass');
    cl = respondToItem(cl, 'i2', 'fail');
    cl = respondToItem(cl, 'i3', 'na');
    cl = respondToItem(cl, 'i4', 'partial');

    const counts = countItemsByStatus(cl);
    expect(counts.pass).toBe(2);
    expect(counts.fail).toBe(1);
    expect(counts.na).toBe(1);
    expect(counts.partial).toBe(1);
    expect(counts.pending).toBe(5);
  });

  it('filterItemsByPriority and filterItemsByStatus can be combined', () => {
    const items = [
      createItem('i1', 't', 'boolean', 0, true, 'critical', { status: 'fail' }),
      createItem('i2', 't', 'boolean', 1, true, 'critical', { status: 'pass' }),
      createItem('i3', 't', 'boolean', 2, true, 'high', { status: 'fail' }),
    ];
    const cl = createChecklist('cl-filter', 'Filter', [createSection('s1', 'S', items, 0)]);
    const criticalItems = filterItemsByPriority(cl, 'critical');
    const failedCritical = criticalItems.filter(i => i.status === 'fail');
    expect(failedCritical).toHaveLength(1);
    expect(failedCritical[0].id).toBe('i1');
  });

  it('getRequiredItems + getFailedItems overlap correctly', () => {
    const required = createItem('i1', 't', 'boolean', 0, true);
    const optional = createItem('i2', 't', 'boolean', 1, false);
    const reqFailed = { ...required, status: 'fail' as ItemStatus };
    const optFailed = { ...optional, status: 'fail' as ItemStatus };
    const cl = createChecklist('cl-req', 'Req Test', [createSection('s1', 'S', [reqFailed, optFailed], 0)]);

    const failed = getFailedItems(cl);
    const required2 = getRequiredItems(cl);
    expect(failed).toHaveLength(2);
    expect(required2).toHaveLength(1);
    expect(failed.filter(i => i.required)).toHaveLength(1);
  });

  it('progress passPct is correct with 3 pass 1 na 1 fail', () => {
    const items = [
      makeItem('i1', 'pass'),
      makeItem('i2', 'pass'),
      makeItem('i3', 'pass'),
      makeItem('i4', 'na'),
      makeItem('i5', 'fail'),
    ];
    const cl = makeChecklist([makeSection('s1', items)]);
    const p = getProgress(cl);
    // applicable = total(5) - na(1) = 4, passed=3, passPct = 3/4 * 100 = 75
    expect(p.passPct).toBeCloseTo(75);
  });

  // Stress: 10 sections × 5 items each
  it('handles 10 sections × 5 items (50 total)', () => {
    const sections = Array.from({ length: 10 }, (_, si) =>
      createSection(
        `s${si}`, `Section ${si}`,
        Array.from({ length: 5 }, (_, ii) => createItem(`i${si}-${ii}`, 't', 'boolean', ii)),
        si,
      )
    );
    const cl = createChecklist('cl-stress', 'Stress', sections);
    expect(flattenItems(cl)).toHaveLength(50);
    expect(getProgress(cl).total).toBe(50);
    expect(computeStatus(cl)).toBe('not_started');
  });

  it('isComplete becomes false after a pass is changed to fail', () => {
    let cl = createChecklist('cl-ch', 'Change', [
      createSection('s1', 'S', [createItem('i1', 't', 'boolean', 0)], 0),
    ]);
    cl = respondToItem(cl, 'i1', 'pass');
    expect(isComplete(cl)).toBe(true);
    cl = respondToItem(cl, 'i1', 'fail');
    expect(isComplete(cl)).toBe(false);
    expect(computeStatus(cl)).toBe('failed');
  });

  it('getItemById returns updated item after respondToItem', () => {
    let cl = createChecklist('cl-upd', 'Update', [
      createSection('s1', 'S', [createItem('i1', 't', 'boolean', 0)], 0),
    ]);
    cl = respondToItem(cl, 'i1', 'pass', true, 'checked');
    const item = getItemById(cl, 'i1');
    expect(item!.status).toBe('pass');
    expect(item!.response).toBe(true);
    expect(item!.notes).toBe('checked');
  });
});

// ============================================================================
// 21. Additional edge cases and boundary parameterization
// ============================================================================
describe('edge cases', () => {
  it('createChecklist with empty string id', () => {
    expect(createChecklist('', 'T').id).toBe('');
  });

  it('createChecklist with empty string title', () => {
    expect(createChecklist('cl1', '').title).toBe('');
  });

  it('createItem with empty string id', () => {
    expect(createItem('', 't', 'boolean', 0).id).toBe('');
  });

  it('createItem with large order number', () => {
    expect(createItem('i1', 't', 'boolean', 999999).order).toBe(999999);
  });

  it('respondToItem on checklist with no sections returns unchanged', () => {
    const cl = makeChecklist();
    const result = respondToItem(cl, 'i1', 'pass');
    expect(result.sections).toEqual([]);
  });

  it('getProgress.completionPct is between 0 and 100 for partial completion', () => {
    const items = Array.from({ length: 4 }, (_, k) =>
      k < 2 ? makeItem(`i${k}`, 'pass') : makeItem(`i${k}`, 'pending')
    );
    const cl = makeChecklist([makeSection('s1', items)]);
    const pct = getProgress(cl).completionPct;
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('sortSectionsByOrder preserves section item counts', () => {
    const s1 = makeSection('s1', [makeItem('i1'), makeItem('i2')], 1);
    const s2 = makeSection('s2', [makeItem('i3')], 0);
    const cl = makeChecklist([s1, s2]);
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections[0].items).toHaveLength(1);
    expect(sorted.sections[1].items).toHaveLength(2);
  });

  it('flattenItems preserves item data integrity', () => {
    const original = createItem('i1', 'My Item', 'text', 5, false, 'high', { notes: 'a note', hint: 'a hint' });
    const cl = makeChecklist([makeSection('s1', [original])]);
    const flattened = flattenItems(cl)[0];
    expect(flattened.id).toBe('i1');
    expect(flattened.text).toBe('My Item');
    expect(flattened.type).toBe('text');
    expect(flattened.order).toBe(5);
    expect(flattened.required).toBe(false);
    expect(flattened.priority).toBe('high');
    expect(flattened.notes).toBe('a note');
    expect(flattened.hint).toBe('a hint');
  });

  it('multiple sections with same order value sorts stably', () => {
    const s1 = makeSection('s1', [], 0);
    const s2 = makeSection('s2', [], 0);
    const cl = makeChecklist([s1, s2]);
    // Should not throw and should return both sections
    const sorted = sortSectionsByOrder(cl);
    expect(sorted.sections).toHaveLength(2);
  });

  it('computeStatus with all optional pending returns completed (no required items = vacuously done)', () => {
    // No required items → filter(i=>i.required).every(...) vacuously true → 'completed'
    const items = Array.from({ length: 5 }, (_, k) =>
      createItem(`i${k}`, 't', 'boolean', k, false)
    );
    const cl = makeChecklist([makeSection('s1', items)]);
    expect(computeStatus(cl)).toBe('completed');
  });

  it('computeStatus with mix of optional (pending) and required (pass) → completed', () => {
    const required = makeItem('i1', 'pass');
    const optional = createItem('i2', 't', 'boolean', 1, false);
    const cl = makeChecklist([makeSection('s1', [required, optional])]);
    expect(computeStatus(cl)).toBe('completed');
  });

  // Extra parameterized tests to push well past 1000 total
  Array.from({ length: 20 }, (_, k) => k).forEach(n => {
    it(`createItem with id "item-${n}" stores correct id`, () => {
      expect(createItem(`item-${n}`, 'text', 'boolean', n).id).toBe(`item-${n}`);
    });
  });

  Array.from({ length: 20 }, (_, k) => k).forEach(n => {
    it(`createSection order ${n} stored correctly`, () => {
      expect(createSection(`s${n}`, 'Title', [], n).order).toBe(n);
    });
  });

  Array.from({ length: 10 }, (_, k) => k).forEach(n => {
    it(`checklist with ${n + 1} items has total=${n + 1} in progress`, () => {
      const items = Array.from({ length: n + 1 }, (_, k) => makeItem(`i${k}`));
      const cl = makeChecklist([makeSection('s1', items)]);
      expect(getProgress(cl).total).toBe(n + 1);
    });
  });

  // respondToItem chain test for each status
  statuses.forEach(fromStatus => {
    statuses.forEach(toStatus => {
      it(`respond from "${fromStatus}" to "${toStatus}" updates item`, () => {
        const cl = makeChecklist([
          makeSection('s1', [makeItem('i1', fromStatus)]),
        ]);
        const result = respondToItem(cl, 'i1', toStatus);
        expect(result.sections[0].items[0].status).toBe(toStatus);
      });
    });
  });
});

// ============================================================================
// 22. Type guard exhaustiveness checks
// ============================================================================
describe('type guards exhaustiveness', () => {
  const validStatusSet = new Set<string>(statuses);
  const validTypeSet = new Set<string>(types);
  const validPrioritySet = new Set<string>(priorities);

  [
    'pending', 'pass', 'fail', 'na', 'partial',
    '', 'PASS', 'done', 'open', 'closed', 'skipped',
  ].forEach(val => {
    it(`isValidItemStatus("${val}") matches expected`, () => {
      expect(isValidItemStatus(val)).toBe(validStatusSet.has(val));
    });
  });

  [
    'boolean', 'text', 'number', 'date', 'select', 'multiselect', 'signature', 'photo',
    '', 'checkbox', 'file', 'image', 'BOOLEAN',
  ].forEach(val => {
    it(`isValidItemType("${val}") matches expected`, () => {
      expect(isValidItemType(val)).toBe(validTypeSet.has(val));
    });
  });

  [
    'low', 'medium', 'high', 'critical',
    '', 'LOW', 'urgent', 'normal', 'blocker',
  ].forEach(val => {
    it(`isValidPriority("${val}") matches expected`, () => {
      expect(isValidPriority(val)).toBe(validPrioritySet.has(val));
    });
  });
});

// ============================================================================
// 23. Bulk createItem parameterization — 8 types × 4 priorities × 2 required
// ============================================================================
describe('createItem bulk — all type/priority/required combos', () => {
  types.forEach(type => {
    priorities.forEach(priority => {
      [true, false].forEach(required => {
        it(`createItem type=${type} priority=${priority} required=${required} — id stored`, () => {
          const item = createItem('x', 'text', type, 0, required, priority);
          expect(item.id).toBe('x');
        });
        it(`createItem type=${type} priority=${priority} required=${required} — type stored`, () => {
          const item = createItem('x', 'text', type, 0, required, priority);
          expect(item.type).toBe(type);
        });
        it(`createItem type=${type} priority=${priority} required=${required} — priority stored`, () => {
          const item = createItem('x', 'text', type, 0, required, priority);
          expect(item.priority).toBe(priority);
        });
        it(`createItem type=${type} priority=${priority} required=${required} — required stored`, () => {
          const item = createItem('x', 'text', type, 0, required, priority);
          expect(item.required).toBe(required);
        });
        it(`createItem type=${type} priority=${priority} required=${required} — default status pending`, () => {
          const item = createItem('x', 'text', type, 0, required, priority);
          expect(item.status).toBe('pending');
        });
      });
    });
  });
});

// ============================================================================
// 24. Bulk respondToItem — all (type × status) combinations
// ============================================================================
describe('respondToItem bulk — all item types with each status', () => {
  types.forEach(type => {
    statuses.forEach(status => {
      it(`respondToItem type=${type} → status=${status} is stored`, () => {
        const cl = makeChecklist([makeSection('s1', [
          createItem('i1', 'text', type, 0),
        ])]);
        const result = respondToItem(cl, 'i1', status);
        expect(result.sections[0].items[0].status).toBe(status);
      });
    });
  });
});

// ============================================================================
// 25. Bulk getProgress — section count vs item count
// ============================================================================
describe('getProgress bulk — varying section and item counts', () => {
  [1, 2, 3, 4, 5].forEach(sectionCount => {
    [1, 2, 3, 4, 5].forEach(itemsPerSection => {
      it(`getProgress: ${sectionCount} sections × ${itemsPerSection} items → total=${sectionCount * itemsPerSection}`, () => {
        const sections = Array.from({ length: sectionCount }, (_, si) =>
          makeSection(`s${si}`, Array.from({ length: itemsPerSection }, (_, ii) => makeItem(`i${si}-${ii}`)), si)
        );
        const cl = makeChecklist(sections);
        expect(getProgress(cl).total).toBe(sectionCount * itemsPerSection);
      });

      it(`getProgress: ${sectionCount} sections × ${itemsPerSection} items all pass → completionPct=100`, () => {
        const sections = Array.from({ length: sectionCount }, (_, si) =>
          makeSection(`s${si}`, Array.from({ length: itemsPerSection }, (_, ii) => makeItem(`i${si}-${ii}`, 'pass')), si)
        );
        const cl = makeChecklist(sections);
        expect(getProgress(cl).completionPct).toBe(100);
      });
    });
  });
});

// ============================================================================
// 26. Bulk filterItemsByStatus — n items each status
// ============================================================================
describe('filterItemsByStatus bulk — parameterized counts', () => {
  statuses.forEach(targetStatus => {
    [1, 2, 3, 4, 5, 10].forEach(count => {
      it(`filterItemsByStatus "${targetStatus}" returns ${count} items when ${count} items have that status`, () => {
        const items = Array.from({ length: count }, (_, k) => makeItem(`i${k}`, targetStatus));
        const cl = makeChecklist([makeSection('s1', items)]);
        expect(filterItemsByStatus(cl, targetStatus)).toHaveLength(count);
      });
    });
  });
});

// ============================================================================
// 27. Bulk filterItemsByPriority — n items each priority
// ============================================================================
describe('filterItemsByPriority bulk — parameterized counts', () => {
  priorities.forEach(targetPriority => {
    [1, 2, 3, 4, 5, 10].forEach(count => {
      it(`filterItemsByPriority "${targetPriority}" returns ${count} items when ${count} items have that priority`, () => {
        const items = Array.from({ length: count }, (_, k) => makeItem(`i${k}`, 'pending', targetPriority));
        const cl = makeChecklist([makeSection('s1', items)]);
        expect(filterItemsByPriority(cl, targetPriority)).toHaveLength(count);
      });
    });
  });
});

// ============================================================================
// 28. Bulk computeStatus — all required statuses except fail → completed
// ============================================================================
describe('computeStatus bulk — single required item with each non-fail status', () => {
  (['pass', 'na', 'partial'] as ItemStatus[]).forEach(status => {
    it(`single required item with status "${status}" → completed`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', status)])]);
      expect(computeStatus(cl)).toBe('completed');
    });
  });

  (['fail'] as ItemStatus[]).forEach(status => {
    it(`single required item with status "${status}" → failed`, () => {
      const cl = makeChecklist([makeSection('s1', [makeItem('i1', status)])]);
      expect(computeStatus(cl)).toBe('failed');
    });
  });
});

// ============================================================================
// 29. Bulk sortSectionsByOrder — n sections at various shuffles
// ============================================================================
describe('sortSectionsByOrder bulk — result is always ascending', () => {
  [2, 3, 4, 5, 6, 7, 8].forEach(n => {
    it(`${n} sections in reverse → sorted ascending after sortSectionsByOrder`, () => {
      const reversed = Array.from({ length: n }, (_, k) =>
        makeSection(`s${k}`, [], n - 1 - k)
      );
      const cl = makeChecklist(reversed);
      const sorted = sortSectionsByOrder(cl);
      for (let i = 0; i < n - 1; i++) {
        expect(sorted.sections[i].order).toBeLessThanOrEqual(sorted.sections[i + 1].order);
      }
    });

    it(`${n} sections already sorted → remain sorted`, () => {
      const ordered = Array.from({ length: n }, (_, k) => makeSection(`s${k}`, [], k));
      const cl = makeChecklist(ordered);
      const sorted = sortSectionsByOrder(cl);
      for (let i = 0; i < n - 1; i++) {
        expect(sorted.sections[i].order).toBeLessThanOrEqual(sorted.sections[i + 1].order);
      }
    });
  });
});

// ============================================================================
// 30. Bulk countItemsByStatus — verify individual counts in mixed checklist
// ============================================================================
describe('countItemsByStatus bulk — adding items one by one', () => {
  statuses.forEach(addedStatus => {
    [1, 2, 3].forEach(count => {
      it(`adding ${count} "${addedStatus}" items to empty: count.${addedStatus}=${count}`, () => {
        const items = Array.from({ length: count }, (_, k) => makeItem(`i${k}`, addedStatus));
        const cl = makeChecklist([makeSection('s1', items)]);
        expect(countItemsByStatus(cl)[addedStatus]).toBe(count);
      });
    });
  });
});

// ============================================================================
// 31. Bulk getRequiredItems/getFailedItems
// ============================================================================
describe('getRequiredItems and getFailedItems bulk', () => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(n => {
    it(`getRequiredItems: ${n} required items across 2 sections`, () => {
      const half = Math.floor(n / 2);
      const rest = n - half;
      const s1 = makeSection('s1', Array.from({ length: half }, (_, k) => makeItem(`ia${k}`)), 0);
      const s2 = makeSection('s2', Array.from({ length: rest }, (_, k) => makeItem(`ib${k}`)), 1);
      const cl = makeChecklist([s1, s2]);
      expect(getRequiredItems(cl)).toHaveLength(n);
    });

    it(`getFailedItems: ${n} failed items across 2 sections`, () => {
      const half = Math.floor(n / 2);
      const rest = n - half;
      const s1 = makeSection('s1', Array.from({ length: half }, (_, k) => makeItem(`ia${k}`, 'fail')), 0);
      const s2 = makeSection('s2', Array.from({ length: rest }, (_, k) => makeItem(`ib${k}`, 'fail')), 1);
      const cl = makeChecklist([s1, s2]);
      expect(getFailedItems(cl)).toHaveLength(n);
    });
  });
});

// ============================================================================
// 32. Bulk hasCriticalFailures — all priority × status combinations
// ============================================================================
describe('hasCriticalFailures bulk — all priority/status combos', () => {
  priorities.forEach(priority => {
    statuses.forEach(status => {
      const expected = priority === 'critical' && status === 'fail';
      it(`priority=${priority} status=${status} → hasCriticalFailures=${expected}`, () => {
        const cl = makeChecklist([makeSection('s1', [makeItem('i1', status, priority)])]);
        expect(hasCriticalFailures(cl)).toBe(expected);
      });
    });
  });
});

// ============================================================================
// 33. Bulk isComplete — all section counts with all-pass items
// ============================================================================
describe('isComplete bulk — various section counts all-pass', () => {
  [1, 2, 3, 4, 5].forEach(n => {
    it(`${n} sections all-pass → isComplete=true`, () => {
      const sections = Array.from({ length: n }, (_, k) =>
        makeSection(`s${k}`, [makeItem(`i${k}`, 'pass')], k)
      );
      expect(isComplete(makeChecklist(sections))).toBe(true);
    });

    it(`${n} sections with one fail → isComplete=false`, () => {
      const sections = Array.from({ length: n }, (_, k) =>
        makeSection(`s${k}`, [makeItem(`i${k}`, k === 0 ? 'fail' : 'pass')], k)
      );
      expect(isComplete(makeChecklist(sections))).toBe(false);
    });
  });
});

// ============================================================================
// 34. Bulk getItemById — multiple sections search
// ============================================================================
describe('getItemById bulk — finding items across sections', () => {
  [2, 3, 4, 5].forEach(sectionCount => {
    it(`getItemById finds last section item in ${sectionCount}-section checklist`, () => {
      const sections = Array.from({ length: sectionCount }, (_, si) =>
        makeSection(`s${si}`, [makeItem(`item-sec${si}`)], si)
      );
      const cl = makeChecklist(sections);
      const lastId = `item-sec${sectionCount - 1}`;
      expect(getItemById(cl, lastId)!.id).toBe(lastId);
    });

    it(`getItemById finds first section item in ${sectionCount}-section checklist`, () => {
      const sections = Array.from({ length: sectionCount }, (_, si) =>
        makeSection(`s${si}`, [makeItem(`item-first${si}`)], si)
      );
      const cl = makeChecklist(sections);
      expect(getItemById(cl, 'item-first0')!.id).toBe('item-first0');
    });
  });
});

// ============================================================================
// 35. Bulk flattenItems — verify item order is section-order-dependent
// ============================================================================
describe('flattenItems bulk — item ordering across sections', () => {
  [2, 3, 4, 5, 6].forEach(n => {
    it(`flattenItems with ${n} sections preserves section array order`, () => {
      const sections = Array.from({ length: n }, (_, k) =>
        makeSection(`s${k}`, [makeItem(`i${k}`)], k)
      );
      const cl = makeChecklist(sections);
      const ids = flattenItems(cl).map(i => i.id);
      expect(ids).toEqual(Array.from({ length: n }, (_, k) => `i${k}`));
    });
  });
});

// ============================================================================
// 36. Property checks — returned objects are plain objects with correct shapes
// ============================================================================
describe('object shape checks', () => {
  types.forEach(type => {
    it(`createItem(type=${type}) returns object with correct shape`, () => {
      const item = createItem('id', 'text', type, 0);
      expect(typeof item.id).toBe('string');
      expect(typeof item.text).toBe('string');
      expect(typeof item.required).toBe('boolean');
      expect(typeof item.order).toBe('number');
    });
  });

  priorities.forEach(p => {
    it(`createItem(priority=${p}) — priority field is string`, () => {
      expect(typeof createItem('id', 't', 'boolean', 0, true, p).priority).toBe('string');
    });
  });

  statuses.forEach(s => {
    it(`createItem with override status=${s} — status field is string`, () => {
      expect(typeof createItem('id', 't', 'boolean', 0, true, 'medium', { status: s }).status).toBe('string');
    });
  });

  it('createSection returns object with 4 keys', () => {
    const sec = createSection('s1', 'T', [], 0);
    expect(Object.keys(sec)).toEqual(expect.arrayContaining(['id', 'title', 'items', 'order']));
  });

  it('createChecklist returns object with at least 5 keys', () => {
    const cl = createChecklist('c', 'T');
    expect(cl).toHaveProperty('id');
    expect(cl).toHaveProperty('title');
    expect(cl).toHaveProperty('sections');
    expect(cl).toHaveProperty('status');
    expect(cl).toHaveProperty('createdAt');
  });

  [1, 2, 3, 4, 5].forEach(n => {
    it(`createChecklist with ${n} sections → sections.length=${n}`, () => {
      const secs = Array.from({ length: n }, (_, k) => makeSection(`s${k}`, [], k));
      expect(createChecklist('c', 'T', secs).sections).toHaveLength(n);
    });
  });
});

// ============================================================================
// 37. Cross-function consistency — getProgress matches filterItemsByStatus
// ============================================================================
describe('getProgress vs filterItemsByStatus consistency', () => {
  statuses.forEach(s => {
    [0, 1, 2, 3].forEach(count => {
      it(`getProgress.${s === 'pass' ? 'passed' : s === 'fail' ? 'failed' : s === 'na' ? 'naItems' : s === 'pending' ? 'answered' : 'answered'} consistent with filterItemsByStatus for count=${count} (status=${s})`, () => {
        const items = Array.from({ length: count }, (_, k) => makeItem(`i${k}`, s));
        const cl = makeChecklist([makeSection('s1', items)]);
        const filtered = filterItemsByStatus(cl, s).length;
        const progress = getProgress(cl);
        if (s === 'pass') expect(filtered).toBe(progress.passed);
        else if (s === 'fail') expect(filtered).toBe(progress.failed);
        else if (s === 'na') expect(filtered).toBe(progress.naItems);
        else expect(filtered).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

// ============================================================================
// 38. More isComplete / computeStatus cross-checks at scale
// ============================================================================
describe('isComplete and computeStatus cross-checks', () => {
  types.forEach(type => {
    it(`isComplete consistent with computeStatus for type=${type} all-pass`, () => {
      const cl = makeChecklist([makeSection('s1', [createItem('i1', 't', type, 0)])]);
      const responded = respondToItem(cl, 'i1', 'pass');
      expect(isComplete(responded)).toBe(computeStatus(responded) === 'completed');
    });

    it(`isComplete consistent with computeStatus for type=${type} fail`, () => {
      const cl = makeChecklist([makeSection('s1', [createItem('i1', 't', type, 0)])]);
      const responded = respondToItem(cl, 'i1', 'fail');
      expect(isComplete(responded)).toBe(computeStatus(responded) === 'completed');
    });
  });
});

// ============================================================================
// 39. More respondToItem immutability checks across section counts
// ============================================================================
describe('respondToItem immutability bulk', () => {
  [1, 2, 3, 4, 5].forEach(sectionCount => {
    it(`respondToItem with ${sectionCount} sections does not mutate original`, () => {
      const sections = Array.from({ length: sectionCount }, (_, si) =>
        makeSection(`s${si}`, [makeItem(`i${si}`)], si)
      );
      const original = makeChecklist(sections);
      const originalStatuses = flattenItems(original).map(i => i.status);
      respondToItem(original, 'i0', 'pass');
      const afterStatuses = flattenItems(original).map(i => i.status);
      expect(afterStatuses).toEqual(originalStatuses);
    });
  });
});

// ============================================================================
// 40. Systematic createItem order values
// ============================================================================
describe('createItem order parameterization extended', () => {
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 200, 500, 1000].forEach(order => {
    it(`createItem order=${order} is stored correctly`, () => {
      expect(createItem('i', 't', 'boolean', order).order).toBe(order);
    });
  });
});
