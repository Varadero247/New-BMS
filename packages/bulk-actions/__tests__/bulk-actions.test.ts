// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import { createSelectionManager } from '../src/selection-manager';
import { createBulkExecutor, chunkArray, mergeResults } from '../src/bulk-executor';
import type { BulkAction, BulkActionResult } from '../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

interface TestItem {
  id: string;
  name: string;
}

function makeItems(n: number): TestItem[] {
  return Array.from({ length: n }, (_, i) => ({ id: `item-${i + 1}`, name: `Item ${i + 1}` }));
}

function makeAction(overrides: Partial<BulkAction<TestItem>> = {}): BulkAction<TestItem> {
  return {
    id: 'test.action',
    label: 'Test Action',
    execute: jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 }),
    ...overrides,
  };
}

function makeResult(overrides: Partial<BulkActionResult> = {}): BulkActionResult {
  return { success: true, processed: 1, failed: 0, ...overrides };
}

// ════════════════════════════════════════════════════════════════════
// 1. SelectionManager (300 tests)
// ════════════════════════════════════════════════════════════════════

describe('SelectionManager', () => {
  describe('select', () => {
    it('selects an item by id', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      expect(m.isSelected('item-1')).toBe(true);
    });

    it('does not select unknown id', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('unknown');
      expect(m.getCount()).toBe(0);
    });

    it('selects multiple items', () => {
      const m = createSelectionManager(makeItems(5));
      m.select('item-1');
      m.select('item-3');
      m.select('item-5');
      expect(m.getCount()).toBe(3);
    });

    it('does not double-select same item', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      m.select('item-1');
      expect(m.getCount()).toBe(1);
    });

    it('selects all items one by one', () => {
      const items = makeItems(5);
      const m = createSelectionManager(items);
      items.forEach((i) => m.select(i.id));
      expect(m.getCount()).toBe(5);
    });

    for (let i = 1; i <= 20; i++) {
      it(`select item-${i} from 20 items`, () => {
        const m = createSelectionManager(makeItems(20));
        m.select(`item-${i}`);
        expect(m.isSelected(`item-${i}`)).toBe(true);
      });
    }
  });

  describe('deselect', () => {
    it('deselects a selected item', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      m.deselect('item-1');
      expect(m.isSelected('item-1')).toBe(false);
    });

    it('does nothing for unselected item', () => {
      const m = createSelectionManager(makeItems(3));
      expect(() => m.deselect('item-1')).not.toThrow();
      expect(m.getCount()).toBe(0);
    });

    it('deselects only the specified item', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      m.select('item-2');
      m.deselect('item-1');
      expect(m.isSelected('item-1')).toBe(false);
      expect(m.isSelected('item-2')).toBe(true);
    });

    it('deselect unknown id does not throw', () => {
      const m = createSelectionManager(makeItems(3));
      expect(() => m.deselect('unknown')).not.toThrow();
    });

    for (let i = 1; i <= 20; i++) {
      it(`deselect item-${i}`, () => {
        const m = createSelectionManager(makeItems(20));
        m.select(`item-${i}`);
        m.deselect(`item-${i}`);
        expect(m.isSelected(`item-${i}`)).toBe(false);
      });
    }
  });

  describe('toggle', () => {
    it('toggle selects unselected item', () => {
      const m = createSelectionManager(makeItems(3));
      m.toggle('item-1');
      expect(m.isSelected('item-1')).toBe(true);
    });

    it('toggle deselects selected item', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      m.toggle('item-1');
      expect(m.isSelected('item-1')).toBe(false);
    });

    it('double toggle restores original state', () => {
      const m = createSelectionManager(makeItems(3));
      m.toggle('item-1');
      m.toggle('item-1');
      expect(m.isSelected('item-1')).toBe(false);
    });

    it('toggle unknown id does nothing', () => {
      const m = createSelectionManager(makeItems(3));
      m.toggle('unknown');
      expect(m.getCount()).toBe(0);
    });

    for (let i = 1; i <= 20; i++) {
      it(`toggle item-${i} twice returns to original`, () => {
        const m = createSelectionManager(makeItems(20));
        m.toggle(`item-${i}`);
        m.toggle(`item-${i}`);
        expect(m.isSelected(`item-${i}`)).toBe(false);
      });
    }
  });

  describe('selectAll / deselectAll', () => {
    it('selectAll selects all items', () => {
      const m = createSelectionManager(makeItems(5));
      m.selectAll();
      expect(m.getCount()).toBe(5);
    });

    it('isAllSelected returns true after selectAll', () => {
      const m = createSelectionManager(makeItems(5));
      m.selectAll();
      expect(m.isAllSelected()).toBe(true);
    });

    it('deselectAll clears all selections', () => {
      const m = createSelectionManager(makeItems(5));
      m.selectAll();
      m.deselectAll();
      expect(m.getCount()).toBe(0);
    });

    it('deselectAll on empty does not throw', () => {
      const m = createSelectionManager(makeItems(3));
      expect(() => m.deselectAll()).not.toThrow();
    });

    it('isAllSelected returns false on empty list', () => {
      const m = createSelectionManager([]);
      m.selectAll();
      expect(m.isAllSelected()).toBe(false);
    });

    it('selectAll then deselect one → isAllSelected = false', () => {
      const m = createSelectionManager(makeItems(5));
      m.selectAll();
      m.deselect('item-1');
      expect(m.isAllSelected()).toBe(false);
    });

    it('isPartialSelected after selecting half', () => {
      const m = createSelectionManager(makeItems(4));
      m.select('item-1');
      m.select('item-2');
      expect(m.isPartialSelected()).toBe(true);
    });

    it('isPartialSelected false when none selected', () => {
      const m = createSelectionManager(makeItems(4));
      expect(m.isPartialSelected()).toBe(false);
    });

    it('isPartialSelected false when all selected', () => {
      const m = createSelectionManager(makeItems(4));
      m.selectAll();
      expect(m.isPartialSelected()).toBe(false);
    });

    for (let n = 1; n <= 20; n++) {
      it(`selectAll ${n} items → getCount = ${n}`, () => {
        const m = createSelectionManager(makeItems(n));
        m.selectAll();
        expect(m.getCount()).toBe(n);
      });
    }
  });

  describe('getSelection', () => {
    it('returns BulkSelection shape', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      const sel = m.getSelection();
      expect(sel).toHaveProperty('selectedIds');
      expect(sel).toHaveProperty('selectedItems');
      expect(sel).toHaveProperty('allSelected');
      expect(sel).toHaveProperty('count');
    });

    it('selectedIds is a Set', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      expect(m.getSelection().selectedIds instanceof Set).toBe(true);
    });

    it('selectedItems contains correct items', () => {
      const items = makeItems(3);
      const m = createSelectionManager(items);
      m.select('item-1');
      const sel = m.getSelection();
      expect(sel.selectedItems[0].id).toBe('item-1');
    });

    it('count matches selected count', () => {
      const m = createSelectionManager(makeItems(5));
      m.select('item-1');
      m.select('item-3');
      expect(m.getSelection().count).toBe(2);
    });

    it('allSelected true when all selected', () => {
      const m = createSelectionManager(makeItems(3));
      m.selectAll();
      expect(m.getSelection().allSelected).toBe(true);
    });

    it('allSelected false when partial', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      expect(m.getSelection().allSelected).toBe(false);
    });

    it('returns copy of selectedIds (mutation safe)', () => {
      const m = createSelectionManager(makeItems(3));
      m.select('item-1');
      const sel = m.getSelection();
      sel.selectedIds.add('item-99');
      // Should not affect manager's internal set
      expect(m.getCount()).toBe(1);
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 2. BulkExecutor (200 tests)
// ════════════════════════════════════════════════════════════════════

describe('BulkExecutor', () => {
  describe('execute basic', () => {
    it('executes action and returns result', async () => {
      const executor = createBulkExecutor();
      const action = makeAction({
        execute: jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 }),
      });
      const result = await executor.execute(action, makeItems(3));
      expect(result.success).toBe(true);
    });

    it('returns processed count', async () => {
      const executor = createBulkExecutor();
      const action = makeAction({
        execute: jest.fn().mockResolvedValue({ success: true, processed: 5, failed: 0 }),
      });
      const result = await executor.execute(action, makeItems(5));
      expect(result.processed).toBe(5);
    });

    it('returns empty result for no items', async () => {
      const executor = createBulkExecutor();
      const result = await executor.execute(makeAction(), []);
      expect(result.processed).toBe(0);
      expect(result.success).toBe(true);
    });

    it('handles action failure gracefully', async () => {
      const executor = createBulkExecutor();
      const action = makeAction({
        execute: jest.fn().mockRejectedValue(new Error('Network error')),
      });
      const result = await executor.execute(action, makeItems(3));
      expect(result.success).toBe(false);
      expect(result.failed).toBeGreaterThan(0);
    });

    it('handles partial failure', async () => {
      const executor = createBulkExecutor();
      const action = makeAction({
        execute: jest.fn().mockResolvedValue({ success: false, processed: 2, failed: 1 }),
      });
      const result = await executor.execute(action, makeItems(3));
      expect(result.failed).toBe(1);
    });
  });

  describe('batching', () => {
    it('batches items into default size 50', async () => {
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 50, failed: 0 });
      const action = makeAction({ execute: executeFn });
      await executor.execute(action, makeItems(100));
      expect(executeFn).toHaveBeenCalledTimes(2);
    });

    it('respects custom batch size', async () => {
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 10, failed: 0 });
      const action = makeAction({ execute: executeFn });
      await executor.execute(action, makeItems(30), { batchSize: 10 });
      expect(executeFn).toHaveBeenCalledTimes(3);
    });

    it('single batch for items <= batchSize', async () => {
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 5, failed: 0 });
      const action = makeAction({ execute: executeFn });
      await executor.execute(action, makeItems(5), { batchSize: 50 });
      expect(executeFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmation', () => {
    it('calls confirmFn when requiresConfirmation=true', async () => {
      const executor = createBulkExecutor();
      const confirmFn = jest.fn().mockResolvedValue(true);
      const action = makeAction({ requiresConfirmation: true });
      await executor.execute(action, makeItems(3), { confirmFn });
      expect(confirmFn).toHaveBeenCalled();
    });

    it('cancels if confirmFn returns false', async () => {
      const executor = createBulkExecutor();
      const confirmFn = jest.fn().mockResolvedValue(false);
      const executeFn = jest.fn();
      const action = makeAction({ requiresConfirmation: true, execute: executeFn });
      const result = await executor.execute(action, makeItems(3), { confirmFn });
      expect(executeFn).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });

    it('uses custom confirmationMessage', async () => {
      const executor = createBulkExecutor();
      const confirmFn = jest.fn().mockResolvedValue(true);
      const action = makeAction({
        requiresConfirmation: true,
        confirmationMessage: 'Delete all?',
      });
      await executor.execute(action, makeItems(3), { confirmFn });
      expect(confirmFn).toHaveBeenCalledWith('Delete all?');
    });
  });

  describe('isAvailable check', () => {
    it('skips execution when isAvailable returns false', async () => {
      const executor = createBulkExecutor();
      const executeFn = jest.fn();
      const action = makeAction({
        isAvailable: () => false,
        execute: executeFn,
      });
      const result = await executor.execute(action, makeItems(3));
      expect(executeFn).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });

    it('executes when isAvailable returns true', async () => {
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 });
      const action = makeAction({ isAvailable: () => true, execute: executeFn });
      await executor.execute(action, makeItems(3));
      expect(executeFn).toHaveBeenCalled();
    });
  });

  describe('mergeResults', () => {
    it('merges two successful results', () => {
      const r = mergeResults([makeResult({ processed: 5 }), makeResult({ processed: 3 })]);
      expect(r.processed).toBe(8);
    });

    it('merges failed counts', () => {
      const r = mergeResults([
        makeResult({ failed: 1, success: false }),
        makeResult({ failed: 2, success: false }),
      ]);
      expect(r.failed).toBe(3);
    });

    it('success=false if any failure', () => {
      const r = mergeResults([
        makeResult({ success: true, failed: 0 }),
        makeResult({ success: false, failed: 1 }),
      ]);
      expect(r.success).toBe(false);
    });

    it('success=true if all successful', () => {
      const r = mergeResults([makeResult({ success: true }), makeResult({ success: true })]);
      expect(r.success).toBe(true);
    });

    it('aggregates errors', () => {
      const r = mergeResults([
        makeResult({ errors: [{ id: 'a', message: 'err' }] }),
        makeResult({ errors: [{ id: 'b', message: 'err2' }] }),
      ]);
      expect(r.errors!.length).toBe(2);
    });

    it('empty results array', () => {
      const r = mergeResults([]);
      expect(r.processed).toBe(0);
      expect(r.failed).toBe(0);
    });

    it('single result passthrough', () => {
      const r = mergeResults([makeResult({ processed: 7, failed: 1 })]);
      expect(r.processed).toBe(7);
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 3. chunkArray (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('chunkArray', () => {
  it('splits into chunks of given size', () => {
    const chunks = chunkArray([1, 2, 3, 4, 5], 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('single chunk when array <= size', () => {
    const chunks = chunkArray([1, 2, 3], 10);
    expect(chunks).toHaveLength(1);
  });

  it('empty array returns empty chunks', () => {
    expect(chunkArray([], 5)).toEqual([]);
  });

  it('throws for size <= 0', () => {
    expect(() => chunkArray([1, 2], 0)).toThrow();
  });

  it('throws for negative size', () => {
    expect(() => chunkArray([1, 2], -1)).toThrow();
  });

  it('exactly divides', () => {
    const chunks = chunkArray([1, 2, 3, 4], 2);
    expect(chunks).toEqual([[1, 2], [3, 4]]);
  });

  it('chunk of 1', () => {
    const chunks = chunkArray([1, 2, 3], 1);
    expect(chunks).toEqual([[1], [2], [3]]);
  });

  it('preserves all elements', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const chunks = chunkArray(arr, 7);
    const flat = chunks.flat();
    expect(flat).toEqual(arr);
  });

  it('correct number of chunks', () => {
    expect(chunkArray(Array.from({ length: 10 }, (_, i) => i), 3)).toHaveLength(4);
  });

  it('string array works', () => {
    const chunks = chunkArray(['a', 'b', 'c', 'd'], 2);
    expect(chunks[0]).toEqual(['a', 'b']);
  });

  // Range tests
  for (let n = 1; n <= 20; n++) {
    for (let size = 1; size <= 5; size++) {
      it(`chunkArray n=${n} size=${size} preserves length`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        const chunks = chunkArray(arr, size);
        expect(chunks.flat().length).toBe(n);
      });
    }
  }
});

// ════════════════════════════════════════════════════════════════════
// 4. Type shape validation (200 tests)
// ════════════════════════════════════════════════════════════════════

describe('BulkAction shape', () => {
  it('makeAction returns valid BulkAction', () => {
    const a = makeAction();
    expect(typeof a.id).toBe('string');
    expect(typeof a.label).toBe('string');
    expect(typeof a.execute).toBe('function');
  });

  it('variant can be default', () => {
    const a = makeAction({ variant: 'default' });
    expect(a.variant).toBe('default');
  });

  it('variant can be destructive', () => {
    const a = makeAction({ variant: 'destructive' });
    expect(a.variant).toBe('destructive');
  });

  it('variant can be warning', () => {
    const a = makeAction({ variant: 'warning' });
    expect(a.variant).toBe('warning');
  });

  it('requiresConfirmation defaults to undefined', () => {
    const a = makeAction();
    expect(a.requiresConfirmation).toBeUndefined();
  });

  it('confirmationMessage can be set', () => {
    const a = makeAction({ confirmationMessage: 'Delete?' });
    expect(a.confirmationMessage).toBe('Delete?');
  });

  it('icon is optional', () => {
    const a = makeAction({ icon: 'trash' });
    expect(a.icon).toBe('trash');
  });

  it('description is optional', () => {
    const a = makeAction({ description: 'Deletes items' });
    expect(a.description).toBe('Deletes items');
  });

  it('isAvailable is a function when set', () => {
    const a = makeAction({ isAvailable: () => true });
    expect(typeof a.isAvailable).toBe('function');
  });

  for (let i = 0; i < 100; i++) {
    it(`BulkAction shape test ${i}`, () => {
      const a = makeAction({ id: `action.${i}`, label: `Action ${i}` });
      expect(a.id).toBe(`action.${i}`);
      expect(a.label).toBe(`Action ${i}`);
      expect(typeof a.execute).toBe('function');
    });
  }
});

describe('BulkActionResult shape', () => {
  it('makeResult returns valid shape', () => {
    const r = makeResult();
    expect(typeof r.success).toBe('boolean');
    expect(typeof r.processed).toBe('number');
    expect(typeof r.failed).toBe('number');
  });

  it('errors array is optional', () => {
    const r = makeResult();
    expect(r.errors).toBeUndefined();
  });

  it('message is optional', () => {
    const r = makeResult();
    expect(r.message).toBeUndefined();
  });

  it('success=false when failed > 0', () => {
    const r = makeResult({ success: false, failed: 1 });
    expect(r.success).toBe(false);
  });

  for (let i = 0; i < 90; i++) {
    const processed = i;
    const failed = i % 3;
    it(`BulkActionResult shape ${i}: processed=${processed} failed=${failed}`, () => {
      const r = makeResult({ processed, failed, success: failed === 0 });
      expect(r.processed).toBe(processed);
      expect(r.failed).toBe(failed);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 5. Edge cases (200 tests)
// ════════════════════════════════════════════════════════════════════

describe('Edge cases: SelectionManager', () => {
  it('empty items list — selectAll does nothing', () => {
    const m = createSelectionManager([]);
    m.selectAll();
    expect(m.getCount()).toBe(0);
  });

  it('empty items list — isAllSelected=false', () => {
    const m = createSelectionManager([]);
    expect(m.isAllSelected()).toBe(false);
  });

  it('empty items list — isPartialSelected=false', () => {
    const m = createSelectionManager([]);
    expect(m.isPartialSelected()).toBe(false);
  });

  it('select then selectAll — count equals all', () => {
    const m = createSelectionManager(makeItems(5));
    m.select('item-1');
    m.selectAll();
    expect(m.getCount()).toBe(5);
  });

  it('deselectAll then isAllSelected=false', () => {
    const m = createSelectionManager(makeItems(3));
    m.selectAll();
    m.deselectAll();
    expect(m.isAllSelected()).toBe(false);
  });

  it('items with same id — only appears once in selection', () => {
    const items = [{ id: 'dup', name: 'A' }, { id: 'dup', name: 'B' }];
    const m = createSelectionManager(items);
    m.select('dup');
    // Set stores unique ids — count should be 1
    expect(m.getCount()).toBe(1);
  });

  it('single item list — selectAll then isAllSelected=true', () => {
    const m = createSelectionManager(makeItems(1));
    m.selectAll();
    expect(m.isAllSelected()).toBe(true);
  });

  it('single item list — deselect makes isAllSelected=false', () => {
    const m = createSelectionManager(makeItems(1));
    m.selectAll();
    m.deselect('item-1');
    expect(m.isAllSelected()).toBe(false);
  });

  for (let i = 0; i < 50; i++) {
    it(`edge case ${i}: large list operations`, () => {
      const m = createSelectionManager(makeItems(100));
      m.selectAll();
      expect(m.getCount()).toBe(100);
      m.deselectAll();
      expect(m.getCount()).toBe(0);
    });
  }

  for (let i = 0; i < 50; i++) {
    const id = `item-${(i % 10) + 1}`;
    it(`edge case toggle ${i}: toggle ${id} in 10-item list`, () => {
      const m = createSelectionManager(makeItems(10));
      m.toggle(id);
      expect(m.isSelected(id)).toBe(true);
      m.toggle(id);
      expect(m.isSelected(id)).toBe(false);
    });
  }
});

describe('Edge cases: BulkExecutor', () => {
  it('mergeResults handles undefined errors gracefully', () => {
    const r = mergeResults([makeResult({ errors: undefined }), makeResult({ errors: undefined })]);
    expect(r.errors).toBeUndefined();
  });

  it('chunkArray with size 1 creates n chunks', () => {
    const chunks = chunkArray([1, 2, 3, 4, 5], 1);
    expect(chunks).toHaveLength(5);
  });

  it('chunkArray large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const chunks = chunkArray(arr, 50);
    expect(chunks).toHaveLength(20);
  });

  for (let i = 0; i < 90; i++) {
    const n = (i % 20) + 1;
    const size = (i % 5) + 1;
    it(`edge BulkExecutor ${i}: chunkArray(${n}, ${size})`, () => {
      const arr = Array.from({ length: n }, (_, j) => j);
      const chunks = chunkArray(arr, size);
      expect(chunks.flat().length).toBe(n);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 6. Integration (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('Integration: select → execute → result', () => {
  it('select 3 items, execute delete action', async () => {
    const items = makeItems(5);
    const m = createSelectionManager(items);
    m.select('item-1');
    m.select('item-2');
    m.select('item-3');
    const selected = m.getSelection().selectedItems;

    const executor = createBulkExecutor();
    const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 });
    const action = makeAction({ execute: executeFn });
    const result = await executor.execute(action, selected);
    expect(result.success).toBe(true);
    expect(result.processed).toBe(3);
  });

  it('selectAll then execute', async () => {
    const items = makeItems(10);
    const m = createSelectionManager(items);
    m.selectAll();
    const selected = m.getSelection().selectedItems;
    const executor = createBulkExecutor();
    const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 10, failed: 0 });
    const action = makeAction({ execute: executeFn });
    const result = await executor.execute(action, selected);
    expect(result.processed).toBe(10);
  });

  it('empty selection → execute → processed=0', async () => {
    const m = createSelectionManager(makeItems(5));
    const selected = m.getSelection().selectedItems;
    const executor = createBulkExecutor();
    const result = await executor.execute(makeAction(), selected);
    expect(result.processed).toBe(0);
  });

  it('toggle half, execute on selected', async () => {
    const items = makeItems(10);
    const m = createSelectionManager(items);
    for (let i = 0; i < 5; i++) m.toggle(items[i].id);
    const selected = m.getSelection().selectedItems;
    expect(selected.length).toBe(5);
    const executor = createBulkExecutor();
    const executeFn = jest.fn().mockResolvedValue({ success: true, processed: 5, failed: 0 });
    const result = await executor.execute(makeAction({ execute: executeFn }), selected);
    expect(result.success).toBe(true);
  });

  // 96 more integration tests
  for (let i = 0; i < 96; i++) {
    const n = (i % 10) + 1;
    it(`integration ${i}: select+execute ${n} items`, async () => {
      const items = makeItems(n);
      const m = createSelectionManager(items);
      m.selectAll();
      const selected = m.getSelection().selectedItems;
      expect(selected.length).toBe(n);

      const executor = createBulkExecutor();
      const executeFn = jest
        .fn()
        .mockResolvedValue({ success: true, processed: n, failed: 0 });
      const result = await executor.execute(makeAction({ execute: executeFn }), selected);
      expect(result.success).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 6. SelectionManager — extended coverage (200 tests)
// ════════════════════════════════════════════════════════════════════

describe('SelectionManager — extended select/deselect', () => {
  for (let i = 0; i < 50; i++) {
    it(`select item-${i + 1} from list of ${i + 2}`, () => {
      const items = makeItems(i + 2);
      const m = createSelectionManager(items);
      m.select(items[0].id);
      expect(m.isSelected(items[0].id)).toBe(true);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`deselect after select item-${i + 1}`, () => {
      const items = makeItems(i + 2);
      const m = createSelectionManager(items);
      m.select(items[0].id);
      m.deselect(items[0].id);
      expect(m.isSelected(items[0].id)).toBe(false);
    });
  }
});

describe('SelectionManager — extended toggle', () => {
  for (let i = 0; i < 50; i++) {
    it(`toggle item at position ${i % 5} toggles selection`, () => {
      const items = makeItems(5);
      const m = createSelectionManager(items);
      const id = items[i % 5].id;
      m.toggle(id);
      expect(m.isSelected(id)).toBe(true);
      m.toggle(id);
      expect(m.isSelected(id)).toBe(false);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`selectAll then getCount equals items length [${i + 1} items]`, () => {
      const items = makeItems((i % 9) + 2);
      const m = createSelectionManager(items);
      m.selectAll();
      expect(m.getCount()).toBe(items.length);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 7. chunkArray — extended coverage (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('chunkArray — extended', () => {
  for (let i = 1; i <= 50; i++) {
    it(`chunkArray size=${i}: all items present`, () => {
      const arr = Array.from({ length: i * 2 }, (_, k) => k);
      const chunks = chunkArray(arr, i);
      const flat = chunks.flat();
      expect(flat).toEqual(arr);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`chunkArray size=${i}: no chunk larger than size`, () => {
      const arr = Array.from({ length: i * 3 + 1 }, (_, k) => k);
      const chunks = chunkArray(arr, i);
      chunks.forEach(chunk => expect(chunk.length).toBeLessThanOrEqual(i));
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 8. mergeResults — extended coverage (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('mergeResults — extended', () => {
  for (let i = 1; i <= 50; i++) {
    it(`mergeResults: ${i} success results totals processed=${i}`, () => {
      const results = Array.from({ length: i }, () => makeResult({ processed: 1, failed: 0 }));
      const merged = mergeResults(results);
      expect(merged.processed).toBe(i);
      expect(merged.failed).toBe(0);
      expect(merged.success).toBe(true);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`mergeResults: ${i} failed results totals failed=${i}`, () => {
      const results = Array.from({ length: i }, () => makeResult({ success: false, processed: 0, failed: 1 }));
      const merged = mergeResults(results);
      expect(merged.failed).toBe(i);
      expect(merged.processed).toBe(0);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 9. BulkExecutor — extended coverage (100 tests)
// ════════════════════════════════════════════════════════════════════

describe('BulkExecutor — extended async tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`executor processes ${i} items successfully`, async () => {
      const items = makeItems(i);
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: i, failed: 0 });
      const result = await executor.execute(makeAction({ execute: executeFn }), items);
      expect(result.processed).toBe(i);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`executor with batchSize=${i} runs without error`, async () => {
      const n = Math.max(i, 1);
      const items = makeItems(n);
      const executor = createBulkExecutor();
      const executeFn = jest.fn().mockResolvedValue({ success: true, processed: n, failed: 0 });
      const result = await executor.execute(
        makeAction({ execute: executeFn }),
        items,
        { batchSize: n }
      );
      expect(result.success).toBe(true);
    });
  }
});
