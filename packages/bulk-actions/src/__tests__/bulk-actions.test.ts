// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { createSelectionManager } from '../selection-manager';
import { chunkArray, mergeResults, createBulkExecutor } from '../bulk-executor';
import type { BulkAction, BulkActionResult } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

interface Item { id: string; name: string; }

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: `item-${i}`, name: `Item ${i}` }));
}

function makeAction(overrides: Partial<BulkAction<Item>> = {}): BulkAction<Item> {
  return {
    id: 'test-action',
    label: 'Test Action',
    execute: jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 }),
    ...overrides,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — initialization
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — initialization', () => {
  it('starts with no selection', () => {
    const mgr = createSelectionManager(makeItems(5));
    expect(mgr.getCount()).toBe(0);
  });
  it('getSelection returns empty selection initially', () => {
    const mgr = createSelectionManager(makeItems(3));
    const sel = mgr.getSelection();
    expect(sel.count).toBe(0);
    expect(sel.selectedIds.size).toBe(0);
    expect(sel.selectedItems).toHaveLength(0);
  });
  it('allSelected is false initially', () => {
    const mgr = createSelectionManager(makeItems(3));
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('isPartialSelected is false initially', () => {
    const mgr = createSelectionManager(makeItems(3));
    expect(mgr.isPartialSelected()).toBe(false);
  });
  it('isSelected returns false for any id initially', () => {
    const mgr = createSelectionManager(makeItems(3));
    expect(mgr.isSelected('item-0')).toBe(false);
  });
  it('works with empty items list', () => {
    const mgr = createSelectionManager([]);
    expect(mgr.getCount()).toBe(0);
  });
  it('isAllSelected false for empty list', () => {
    const mgr = createSelectionManager([]);
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('isPartialSelected false for empty list', () => {
    const mgr = createSelectionManager([]);
    expect(mgr.isPartialSelected()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — select
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — select', () => {
  let items: Item[];
  let mgr: ReturnType<typeof createSelectionManager<Item>>;
  beforeEach(() => {
    items = makeItems(5);
    mgr = createSelectionManager(items);
  });

  it('select adds id to selection', () => {
    mgr.select('item-0');
    expect(mgr.isSelected('item-0')).toBe(true);
  });
  it('count increases after select', () => {
    mgr.select('item-0');
    expect(mgr.getCount()).toBe(1);
  });
  it('selecting non-existent id is no-op', () => {
    mgr.select('nonexistent');
    expect(mgr.getCount()).toBe(0);
  });
  it('selecting same id twice does not double count', () => {
    mgr.select('item-0');
    mgr.select('item-0');
    expect(mgr.getCount()).toBe(1);
  });
  it('can select multiple items', () => {
    mgr.select('item-0');
    mgr.select('item-1');
    mgr.select('item-2');
    expect(mgr.getCount()).toBe(3);
  });
  it('getSelection includes selected items', () => {
    mgr.select('item-0');
    const sel = mgr.getSelection();
    expect(sel.selectedItems).toHaveLength(1);
    expect(sel.selectedItems[0].id).toBe('item-0');
  });
  it('getSelection selectedIds contains selected id', () => {
    mgr.select('item-1');
    expect(mgr.getSelection().selectedIds.has('item-1')).toBe(true);
  });
  it('allSelected false when not all selected', () => {
    mgr.select('item-0');
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('allSelected true when all selected', () => {
    items.forEach(i => mgr.select(i.id));
    expect(mgr.isAllSelected()).toBe(true);
  });
  it('isPartialSelected true when some selected', () => {
    mgr.select('item-0');
    expect(mgr.isPartialSelected()).toBe(true);
  });
  it('getSelection.count matches getCount', () => {
    mgr.select('item-0');
    mgr.select('item-2');
    expect(mgr.getSelection().count).toBe(mgr.getCount());
  });
  it('getSelection returns copy of selectedIds Set', () => {
    mgr.select('item-0');
    const sel1 = mgr.getSelection();
    mgr.select('item-1');
    const sel2 = mgr.getSelection();
    expect(sel1.count).toBe(1);
    expect(sel2.count).toBe(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — deselect
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — deselect', () => {
  let mgr: ReturnType<typeof createSelectionManager<Item>>;
  beforeEach(() => {
    mgr = createSelectionManager(makeItems(5));
    mgr.select('item-0');
    mgr.select('item-1');
  });

  it('deselect removes id from selection', () => {
    mgr.deselect('item-0');
    expect(mgr.isSelected('item-0')).toBe(false);
  });
  it('count decreases after deselect', () => {
    mgr.deselect('item-0');
    expect(mgr.getCount()).toBe(1);
  });
  it('other selections unaffected', () => {
    mgr.deselect('item-0');
    expect(mgr.isSelected('item-1')).toBe(true);
  });
  it('deselect non-selected id is no-op', () => {
    mgr.deselect('item-3');
    expect(mgr.getCount()).toBe(2);
  });
  it('deselect nonexistent id is no-op', () => {
    mgr.deselect('nonexistent');
    expect(mgr.getCount()).toBe(2);
  });
  it('deselecting all leaves count 0', () => {
    mgr.deselect('item-0');
    mgr.deselect('item-1');
    expect(mgr.getCount()).toBe(0);
  });
  it('getSelection.allSelected false after deselect', () => {
    mgr.select('item-2');
    mgr.select('item-3');
    mgr.select('item-4');
    mgr.deselect('item-0');
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('isPartialSelected false when all deselected', () => {
    mgr.deselect('item-0');
    mgr.deselect('item-1');
    expect(mgr.isPartialSelected()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — toggle
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — toggle', () => {
  let mgr: ReturnType<typeof createSelectionManager<Item>>;
  beforeEach(() => { mgr = createSelectionManager(makeItems(5)); });

  it('toggle selects unselected item', () => {
    mgr.toggle('item-0');
    expect(mgr.isSelected('item-0')).toBe(true);
  });
  it('toggle deselects selected item', () => {
    mgr.select('item-0');
    mgr.toggle('item-0');
    expect(mgr.isSelected('item-0')).toBe(false);
  });
  it('toggle twice returns to original state', () => {
    mgr.toggle('item-0');
    mgr.toggle('item-0');
    expect(mgr.isSelected('item-0')).toBe(false);
  });
  it('toggle count changes correctly', () => {
    mgr.toggle('item-0');
    expect(mgr.getCount()).toBe(1);
    mgr.toggle('item-0');
    expect(mgr.getCount()).toBe(0);
  });
  it('toggle nonexistent id is no-op', () => {
    mgr.toggle('nonexistent');
    expect(mgr.getCount()).toBe(0);
  });
  it('toggle multiple items', () => {
    mgr.toggle('item-0');
    mgr.toggle('item-1');
    mgr.toggle('item-2');
    expect(mgr.getCount()).toBe(3);
  });
  it('toggle on/off cycles correctly', () => {
    for (let i = 0; i < 10; i++) {
      mgr.toggle('item-0');
      expect(mgr.isSelected('item-0')).toBe(i % 2 === 0);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — selectAll / deselectAll
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — selectAll', () => {
  it('selects all items', () => {
    const items = makeItems(5);
    const mgr = createSelectionManager(items);
    mgr.selectAll();
    expect(mgr.getCount()).toBe(5);
  });
  it('isAllSelected true after selectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.selectAll();
    expect(mgr.isAllSelected()).toBe(true);
  });
  it('isPartialSelected false after selectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.selectAll();
    expect(mgr.isPartialSelected()).toBe(false);
  });
  it('getSelection.allSelected true after selectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.selectAll();
    expect(mgr.getSelection().allSelected).toBe(true);
  });
  it('selectAll on empty list is no-op', () => {
    const mgr = createSelectionManager([]);
    mgr.selectAll();
    expect(mgr.getCount()).toBe(0);
  });
  it('selectAll on single item selects it', () => {
    const mgr = createSelectionManager([{ id: 'only', name: 'Only' }]);
    mgr.selectAll();
    expect(mgr.isSelected('only')).toBe(true);
    expect(mgr.isAllSelected()).toBe(true);
  });
  it('selectAll is idempotent', () => {
    const mgr = createSelectionManager(makeItems(4));
    mgr.selectAll();
    mgr.selectAll();
    expect(mgr.getCount()).toBe(4);
  });
  it('selectAll after partial selection selects remaining', () => {
    const items = makeItems(5);
    const mgr = createSelectionManager(items);
    mgr.select('item-0');
    mgr.select('item-1');
    mgr.selectAll();
    expect(mgr.getCount()).toBe(5);
  });
});

describe('SelectionManager — deselectAll', () => {
  it('clears all selections', () => {
    const items = makeItems(5);
    const mgr = createSelectionManager(items);
    mgr.selectAll();
    mgr.deselectAll();
    expect(mgr.getCount()).toBe(0);
  });
  it('isSelected false for all after deselectAll', () => {
    const items = makeItems(3);
    const mgr = createSelectionManager(items);
    mgr.selectAll();
    mgr.deselectAll();
    items.forEach(i => expect(mgr.isSelected(i.id)).toBe(false));
  });
  it('isAllSelected false after deselectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.selectAll();
    mgr.deselectAll();
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('isPartialSelected false after deselectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.select('item-0');
    mgr.deselectAll();
    expect(mgr.isPartialSelected()).toBe(false);
  });
  it('deselectAll on empty selection is no-op', () => {
    const mgr = createSelectionManager(makeItems(3));
    expect(() => mgr.deselectAll()).not.toThrow();
    expect(mgr.getCount()).toBe(0);
  });
  it('can selectAll after deselectAll', () => {
    const mgr = createSelectionManager(makeItems(3));
    mgr.selectAll();
    mgr.deselectAll();
    mgr.selectAll();
    expect(mgr.isAllSelected()).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// chunkArray
// ═════════════════════════════════════════════════════════════════════════════

describe('chunkArray', () => {
  it('throws for size 0', () => expect(() => chunkArray([1, 2, 3], 0)).toThrow());
  it('throws for negative size', () => expect(() => chunkArray([1, 2, 3], -1)).toThrow());
  it('empty array → []', () => expect(chunkArray([], 3)).toEqual([]));
  it('array smaller than chunk size → one chunk', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });
  it('array equal to chunk size → one chunk', () => {
    expect(chunkArray([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });
  it('size 1 → each element in own chunk', () => {
    expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
  it('chunk size 2 with 5 elements → 3 chunks', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('chunk size 2 with 4 elements → 2 chunks', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });
  it('chunk size 3 with 9 elements → 3 chunks', () => {
    expect(chunkArray([1,2,3,4,5,6,7,8,9], 3)).toEqual([[1,2,3],[4,5,6],[7,8,9]]);
  });
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7];
    const chunks = chunkArray(arr, 3);
    expect(chunks.flat()).toEqual(arr);
  });
  it('returns array of arrays', () => {
    const chunks = chunkArray([1, 2, 3], 2);
    expect(Array.isArray(chunks)).toBe(true);
    chunks.forEach(c => expect(Array.isArray(c)).toBe(true));
  });
  it('works with string arrays', () => {
    const chunks = chunkArray(['a', 'b', 'c', 'd'], 2);
    expect(chunks).toEqual([['a', 'b'], ['c', 'd']]);
  });
  it('works with object arrays', () => {
    const items = makeItems(4);
    const chunks = chunkArray(items, 2);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(2);
  });
  it('chunk of 50 from 100 elements → 2 chunks', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    expect(chunkArray(arr, 50)).toHaveLength(2);
  });
  it('does not mutate original array', () => {
    const arr = [1, 2, 3, 4];
    const original = [...arr];
    chunkArray(arr, 2);
    expect(arr).toEqual(original);
  });
  it('size larger than array → one chunk', () => {
    expect(chunkArray([1], 100)).toEqual([[1]]);
  });
  it('total elements in all chunks equals original length', () => {
    const arr = Array.from({ length: 17 }, (_, i) => i);
    const chunks = chunkArray(arr, 5);
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    expect(total).toBe(17);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// mergeResults
// ═════════════════════════════════════════════════════════════════════════════

describe('mergeResults', () => {
  it('merges empty results → zeros', () => {
    const result = mergeResults([]);
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.success).toBe(true);
  });
  it('single success result', () => {
    const result = mergeResults([{ success: true, processed: 5, failed: 0 }]);
    expect(result.processed).toBe(5);
    expect(result.failed).toBe(0);
    expect(result.success).toBe(true);
  });
  it('single failure result', () => {
    const result = mergeResults([{ success: false, processed: 0, failed: 3 }]);
    expect(result.failed).toBe(3);
    expect(result.success).toBe(false);
  });
  it('merges multiple results: processed sum', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 10, failed: 0 },
      { success: true, processed: 20, failed: 0 },
    ];
    expect(mergeResults(results).processed).toBe(30);
  });
  it('merges multiple results: failed sum', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 5, failed: 0 },
      { success: false, processed: 0, failed: 3 },
    ];
    expect(mergeResults(results).failed).toBe(3);
  });
  it('success false if any result has failures', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 10, failed: 0 },
      { success: false, processed: 0, failed: 1 },
    ];
    expect(mergeResults(results).success).toBe(false);
  });
  it('success true when all results have failed=0', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 5, failed: 0 },
      { success: true, processed: 5, failed: 0 },
    ];
    expect(mergeResults(results).success).toBe(true);
  });
  it('merges errors from multiple results', () => {
    const results: BulkActionResult[] = [
      { success: false, processed: 0, failed: 1, errors: [{ id: 'e1', message: 'err1' }] },
      { success: false, processed: 0, failed: 1, errors: [{ id: 'e2', message: 'err2' }] },
    ];
    const merged = mergeResults(results);
    expect(merged.errors).toHaveLength(2);
  });
  it('errors is undefined when no errors', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 5, failed: 0 },
    ];
    expect(mergeResults(results).errors).toBeUndefined();
  });
  it('message includes processed count', () => {
    const results: BulkActionResult[] = [{ success: true, processed: 7, failed: 0 }];
    expect(mergeResults(results).message).toContain('7');
  });
  it('message includes failed count', () => {
    const results: BulkActionResult[] = [{ success: false, processed: 0, failed: 3 }];
    expect(mergeResults(results).message).toContain('3');
  });
  it('returns BulkActionResult shape', () => {
    const result = mergeResults([]);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('processed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('message');
  });
  it('merging 3 results with all properties', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 10, failed: 0 },
      { success: true, processed: 10, failed: 0 },
      { success: false, processed: 5, failed: 2, errors: [{ id: 'e1', message: 'err' }] },
    ];
    const merged = mergeResults(results);
    expect(merged.processed).toBe(25);
    expect(merged.failed).toBe(2);
    expect(merged.success).toBe(false);
    expect(merged.errors).toHaveLength(1);
  });
  it('results with no errors property: errors not in merged', () => {
    const results: BulkActionResult[] = [
      { success: true, processed: 1, failed: 0 },
    ];
    const merged = mergeResults(results);
    expect(merged.errors).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BulkExecutor — execute
// ═════════════════════════════════════════════════════════════════════════════

describe('BulkExecutor — empty items', () => {
  it('returns success with 0 processed for empty items', async () => {
    const executor = createBulkExecutor();
    const action = makeAction();
    const result = await executor.execute(action, []);
    expect(result.success).toBe(true);
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(0);
  });
  it('does not call action.execute for empty items', async () => {
    const executor = createBulkExecutor();
    const execute = jest.fn();
    const action = makeAction({ execute });
    await executor.execute(action, []);
    expect(execute).not.toHaveBeenCalled();
  });
  it('message indicates nothing to process', async () => {
    const executor = createBulkExecutor();
    const result = await executor.execute(makeAction(), []);
    expect(result.message).toBeTruthy();
  });
});

describe('BulkExecutor — basic execution', () => {
  it('calls action.execute with items', async () => {
    const items = makeItems(3);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 });
    const executor = createBulkExecutor();
    await executor.execute(makeAction({ execute }), items);
    expect(execute).toHaveBeenCalledWith(items);
  });
  it('returns success result from action', async () => {
    const items = makeItems(3);
    const executor = createBulkExecutor();
    const action = makeAction({
      execute: jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 }),
    });
    const result = await executor.execute(action, items);
    expect(result.success).toBe(true);
    expect(result.processed).toBe(3);
  });
  it('returns failure result from action', async () => {
    const items = makeItems(3);
    const executor = createBulkExecutor();
    const action = makeAction({
      execute: jest.fn().mockResolvedValue({ success: false, processed: 0, failed: 3 }),
    });
    const result = await executor.execute(action, items);
    expect(result.success).toBe(false);
    expect(result.failed).toBe(3);
  });
  it('handles action.execute throwing', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({
      execute: jest.fn().mockRejectedValue(new Error('network error')),
    });
    const result = await executor.execute(action, makeItems(2));
    expect(result.success).toBe(false);
    expect(result.failed).toBeGreaterThan(0);
  });
  it('execute error message included in errors', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({
      execute: jest.fn().mockRejectedValue(new Error('batch failed')),
    });
    const result = await executor.execute(action, makeItems(2));
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain('batch failed');
  });
});

describe('BulkExecutor — batching', () => {
  it('batches items into chunks of batchSize', async () => {
    const items = makeItems(10);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 5, failed: 0 });
    const executor = createBulkExecutor();
    await executor.execute(makeAction({ execute }), items, { batchSize: 5 });
    expect(execute).toHaveBeenCalledTimes(2);
  });
  it('batchSize 1 calls action.execute once per item', async () => {
    const items = makeItems(4);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 });
    const executor = createBulkExecutor();
    await executor.execute(makeAction({ execute }), items, { batchSize: 1 });
    expect(execute).toHaveBeenCalledTimes(4);
  });
  it('batchSize larger than items → single call', async () => {
    const items = makeItems(3);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 });
    const executor = createBulkExecutor();
    await executor.execute(makeAction({ execute }), items, { batchSize: 100 });
    expect(execute).toHaveBeenCalledTimes(1);
  });
  it('merged results sum all batches', async () => {
    const items = makeItems(6);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 });
    const executor = createBulkExecutor();
    const result = await executor.execute(makeAction({ execute }), items, { batchSize: 3 });
    expect(result.processed).toBe(6);
    expect(result.failed).toBe(0);
  });
  it('default batchSize is 50', async () => {
    const items = makeItems(51);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 50, failed: 0 });
    const executor = createBulkExecutor();
    await executor.execute(makeAction({ execute }), items);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});

describe('BulkExecutor — confirmation', () => {
  it('calls confirmFn when requiresConfirmation is true', async () => {
    const confirmFn = jest.fn().mockResolvedValue(true);
    const executor = createBulkExecutor();
    const action = makeAction({ requiresConfirmation: true });
    await executor.execute(action, makeItems(2), { confirmFn });
    expect(confirmFn).toHaveBeenCalled();
  });
  it('proceeds when confirmation returns true', async () => {
    const confirmFn = jest.fn().mockResolvedValue(true);
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 2, failed: 0 });
    const executor = createBulkExecutor();
    const action = makeAction({ requiresConfirmation: true, execute });
    await executor.execute(action, makeItems(2), { confirmFn });
    expect(execute).toHaveBeenCalled();
  });
  it('cancels when confirmation returns false', async () => {
    const confirmFn = jest.fn().mockResolvedValue(false);
    const execute = jest.fn();
    const executor = createBulkExecutor();
    const action = makeAction({ requiresConfirmation: true, execute });
    const result = await executor.execute(action, makeItems(2), { confirmFn });
    expect(execute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Cancelled');
  });
  it('uses confirmationMessage when provided', async () => {
    const confirmFn = jest.fn().mockResolvedValue(true);
    const executor = createBulkExecutor();
    const action = makeAction({
      requiresConfirmation: true,
      confirmationMessage: 'Custom message',
      execute: jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 }),
    });
    await executor.execute(action, makeItems(1), { confirmFn });
    expect(confirmFn).toHaveBeenCalledWith('Custom message');
  });
  it('default confirmation message used when none provided', async () => {
    const confirmFn = jest.fn().mockResolvedValue(true);
    const executor = createBulkExecutor();
    const action = makeAction({
      requiresConfirmation: true,
      label: 'Delete Items',
      execute: jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 }),
    });
    await executor.execute(action, makeItems(1), { confirmFn });
    expect(confirmFn).toHaveBeenCalledWith(expect.stringContaining('Delete Items'));
  });
  it('does not call confirmFn when requiresConfirmation is false', async () => {
    const confirmFn = jest.fn().mockResolvedValue(true);
    const executor = createBulkExecutor();
    const action = makeAction({ requiresConfirmation: false });
    await executor.execute(action, makeItems(2), { confirmFn });
    expect(confirmFn).not.toHaveBeenCalled();
  });
  it('does not call confirmFn when no confirmFn provided', async () => {
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 1, failed: 0 });
    const executor = createBulkExecutor();
    const action = makeAction({ requiresConfirmation: true, execute });
    // No confirmFn → proceeds
    await executor.execute(action, makeItems(1));
    expect(execute).toHaveBeenCalled();
  });
});

describe('BulkExecutor — isAvailable', () => {
  it('proceeds when isAvailable returns true', async () => {
    const execute = jest.fn().mockResolvedValue({ success: true, processed: 2, failed: 0 });
    const executor = createBulkExecutor();
    const action = makeAction({ isAvailable: () => true, execute });
    const result = await executor.execute(action, makeItems(2));
    expect(execute).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
  it('returns failure when isAvailable returns false', async () => {
    const execute = jest.fn();
    const executor = createBulkExecutor();
    const action = makeAction({ isAvailable: () => false, execute });
    const result = await executor.execute(action, makeItems(2));
    expect(execute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.failed).toBe(2);
  });
  it('isAvailable receives selected items', async () => {
    const items = makeItems(3);
    const isAvailable = jest.fn().mockReturnValue(true);
    const executor = createBulkExecutor();
    const action = makeAction({
      isAvailable,
      execute: jest.fn().mockResolvedValue({ success: true, processed: 3, failed: 0 }),
    });
    await executor.execute(action, items);
    expect(isAvailable).toHaveBeenCalledWith(items);
  });
  it('isAvailable false with message', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({ isAvailable: () => false });
    const result = await executor.execute(action, makeItems(3));
    expect(result.message).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Types — verify exports
// ═════════════════════════════════════════════════════════════════════════════

describe('Type & export verification', () => {
  it('createSelectionManager is a function', () => expect(typeof createSelectionManager).toBe('function'));
  it('chunkArray is a function', () => expect(typeof chunkArray).toBe('function'));
  it('mergeResults is a function', () => expect(typeof mergeResults).toBe('function'));
  it('createBulkExecutor is a function', () => expect(typeof createBulkExecutor).toBe('function'));
  it('createSelectionManager returns object', () => expect(typeof createSelectionManager([])).toBe('object'));
  it('createBulkExecutor returns object with execute', () => {
    expect(typeof createBulkExecutor().execute).toBe('function');
  });
  it('chunkArray returns array', () => expect(Array.isArray(chunkArray([1,2,3], 2))).toBe(true));
  it('mergeResults returns object', () => expect(typeof mergeResults([])).toBe('object'));
  it('selection manager has select method', () => expect(typeof createSelectionManager([]).select).toBe('function'));
  it('selection manager has deselect method', () => expect(typeof createSelectionManager([]).deselect).toBe('function'));
  it('selection manager has toggle method', () => expect(typeof createSelectionManager([]).toggle).toBe('function'));
  it('selection manager has selectAll method', () => expect(typeof createSelectionManager([]).selectAll).toBe('function'));
  it('selection manager has deselectAll method', () => expect(typeof createSelectionManager([]).deselectAll).toBe('function'));
  it('selection manager has isSelected method', () => expect(typeof createSelectionManager([]).isSelected).toBe('function'));
  it('selection manager has getSelection method', () => expect(typeof createSelectionManager([]).getSelection).toBe('function'));
  it('selection manager has getCount method', () => expect(typeof createSelectionManager([]).getCount).toBe('function'));
  it('selection manager has isAllSelected method', () => expect(typeof createSelectionManager([]).isAllSelected).toBe('function'));
  it('selection manager has isPartialSelected method', () => expect(typeof createSelectionManager([]).isPartialSelected).toBe('function'));
});

// ═════════════════════════════════════════════════════════════════════════════
// SelectionManager — large dataset
// ═════════════════════════════════════════════════════════════════════════════

describe('SelectionManager — large dataset', () => {
  it('can handle 100 items', () => {
    const mgr = createSelectionManager(makeItems(100));
    mgr.selectAll();
    expect(mgr.getCount()).toBe(100);
    expect(mgr.isAllSelected()).toBe(true);
  });
  it('can deselect all 100 items', () => {
    const mgr = createSelectionManager(makeItems(100));
    mgr.selectAll();
    mgr.deselectAll();
    expect(mgr.getCount()).toBe(0);
  });
  it('partial selection on 100 items', () => {
    const mgr = createSelectionManager(makeItems(100));
    for (let i = 0; i < 50; i++) mgr.select(`item-${i}`);
    expect(mgr.getCount()).toBe(50);
    expect(mgr.isPartialSelected()).toBe(true);
    expect(mgr.isAllSelected()).toBe(false);
  });
  it('getSelection returns correct count on large dataset', () => {
    const mgr = createSelectionManager(makeItems(50));
    mgr.selectAll();
    expect(mgr.getSelection().count).toBe(50);
    expect(mgr.getSelection().selectedItems).toHaveLength(50);
  });
  it('toggle all items manually gives same result as selectAll', () => {
    const items = makeItems(10);
    const mgr = createSelectionManager(items);
    items.forEach(i => mgr.toggle(i.id));
    expect(mgr.isAllSelected()).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BulkExecutor — additional coverage
// ═════════════════════════════════════════════════════════════════════════════

describe('BulkExecutor — additional coverage', () => {
  it('execute returns BulkActionResult shape', async () => {
    const executor = createBulkExecutor();
    const result = await executor.execute(makeAction(), makeItems(1));
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('processed');
    expect(result).toHaveProperty('failed');
  });
  it('partial batch failure handled', async () => {
    const items = makeItems(4);
    let call = 0;
    const execute = jest.fn().mockImplementation(() => {
      call++;
      if (call === 1) return Promise.resolve({ success: true, processed: 2, failed: 0 });
      return Promise.resolve({ success: false, processed: 0, failed: 2, errors: [{ id: 'e1', message: 'fail' }] });
    });
    const executor = createBulkExecutor();
    const result = await executor.execute(makeAction({ execute }), items, { batchSize: 2 });
    expect(result.processed).toBe(2);
    expect(result.failed).toBe(2);
    expect(result.success).toBe(false);
  });
  it('variant property on action is optional', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({ variant: 'destructive' });
    const result = await executor.execute(action, makeItems(1));
    expect(result.success).toBe(true);
  });
  it('description property on action is optional', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({ description: 'This action deletes records' });
    const result = await executor.execute(action, makeItems(1));
    expect(result.success).toBe(true);
  });
  it('icon property on action is optional', async () => {
    const executor = createBulkExecutor();
    const action = makeAction({ icon: 'trash-icon' });
    const result = await executor.execute(action, makeItems(1));
    expect(result.success).toBe(true);
  });
});
