// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createCommand,
  createCommandHistory,
  createMacro,
  createTransaction,
  batch,
  withRetry,
  when,
} from '../command-pattern';

// ============================================================
// Section 1: createCommand + execute (200 tests)
// ============================================================
describe('createCommand + execute', () => {
  describe('return values (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      it(`returns ${i} from execute [${i}]`, () => {
        const cmd = createCommand(() => i);
        expect(cmd.execute()).toBe(i);
      });
    }
  });

  describe('fn invocation and undo (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      it(`execute invokes fn and undo runs [${i}]`, () => {
        const exFn = jest.fn(() => i * 2);
        const unFn = jest.fn();
        const cmd = createCommand(exFn, unFn, `desc-${i}`);
        expect(cmd.execute()).toBe(i * 2);
        expect(exFn).toHaveBeenCalledTimes(1);
        cmd.undo!();
        expect(unFn).toHaveBeenCalledTimes(1);
        expect(cmd.description).toBe(`desc-${i}`);
      });
    }
  });
});

// ============================================================
// Section 2: CommandHistory execute (200 tests)
// ============================================================
describe('CommandHistory execute', () => {
  describe('single command tracking (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      it(`tracks command returning ${i} in history [${i}]`, () => {
        const h = createCommandHistory<number>();
        const cmd = createCommand(() => i);
        const result = h.execute(cmd);
        expect(result).toBe(i);
        expect(h.history()).toHaveLength(1);
        expect(h.canUndo()).toBe(true);
        expect(h.canRedo()).toBe(false);
      });
    }
  });

  describe('multiple commands and future clearing (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      const n = (i % 9) + 2;
      it(`history length ${n} after ${n} executes [${i}]`, () => {
        const h = createCommandHistory<number>();
        for (let k = 0; k < n; k++) {
          h.execute(createCommand(() => k));
        }
        expect(h.history()).toHaveLength(n);
        expect(h.future()).toHaveLength(0);
      });
    }
  });
});

// ============================================================
// Section 3: CommandHistory undo/redo (200 tests)
// ============================================================
describe('CommandHistory undo/redo', () => {
  describe('undo state transitions (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      const n = (i % 5) + 1;
      it(`after ${n} undo(s), canUndo is false and canRedo is true [${i}]`, () => {
        const h = createCommandHistory<number>();
        for (let k = 0; k < n; k++) h.execute(createCommand(() => k));
        for (let k = 0; k < n; k++) h.undo();
        expect(h.canUndo()).toBe(false);
        expect(h.canRedo()).toBe(true);
        expect(h.future()).toHaveLength(n);
      });
    }
  });

  describe('redo state transitions (100 tests)', () => {
    for (let i = 0; i < 100; i++) {
      const n = (i % 5) + 1;
      it(`after undo then redo ${n} time(s), future is empty [${i}]`, () => {
        const h = createCommandHistory<number>();
        for (let k = 0; k < n; k++) h.execute(createCommand(() => k));
        for (let k = 0; k < n; k++) h.undo();
        for (let k = 0; k < n; k++) h.redo();
        expect(h.canRedo()).toBe(false);
        expect(h.canUndo()).toBe(true);
        expect(h.history()).toHaveLength(n);
      });
    }
  });
});

// ============================================================
// Section 4: createMacro (100 tests)
// ============================================================
describe('createMacro', () => {
  describe('execute returns all results (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`macro with ${n} commands returns array of length ${n} [${i}]`, () => {
        const cmds = Array.from({ length: n }, (_, j) => createCommand(() => i + j));
        const macro = createMacro(cmds);
        const results = macro.execute();
        expect(results).toHaveLength(n);
        for (let j = 0; j < n; j++) expect(results[j]).toBe(i + j);
      });
    }
  });

  describe('undo calls sub-command undo in reverse (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`macro undo calls ${n} undo fns in reverse [${i}]`, () => {
        const order: number[] = [];
        const cmds = Array.from({ length: n }, (_, j) =>
          createCommand(() => j, () => order.push(j))
        );
        const macro = createMacro(cmds);
        macro.execute();
        macro.undo!();
        const expected = Array.from({ length: n }, (_, j) => n - 1 - j);
        expect(order).toEqual(expected);
      });
    }
  });
});

// ============================================================
// Section 5: createTransaction (100 tests)
// ============================================================
describe('createTransaction', () => {
  describe('commit runs all commands (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`commit runs ${n} commands in order [${i}]`, () => {
        const calls: number[] = [];
        const tx = createTransaction();
        for (let j = 0; j < n; j++) tx.add(createCommand(() => { calls.push(j); }));
        tx.commit();
        expect(calls).toEqual(Array.from({ length: n }, (_, j) => j));
      });
    }
  });

  describe('rollback undoes executed commands in reverse (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`rollback undoes ${n} commands in reverse [${i}]`, () => {
        const order: number[] = [];
        const tx = createTransaction();
        for (let j = 0; j < n; j++) tx.add(createCommand(() => {}, () => order.push(j)));
        tx.commit();
        tx.rollback();
        const expected = Array.from({ length: n }, (_, j) => n - 1 - j);
        expect(order).toEqual(expected);
      });
    }
  });
});

// ============================================================
// Section 6: batch (100 tests)
// ============================================================
describe('batch', () => {
  describe('returns all results (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`batch ${n} commands returns correct results [${i}]`, () => {
        const cmds = Array.from({ length: n }, (_, j) => createCommand(() => i * 10 + j));
        const b = batch(cmds);
        const results = b.execute();
        expect(results).toHaveLength(n);
        for (let j = 0; j < n; j++) expect(results[j]).toBe(i * 10 + j);
      });
    }
  });

  describe('undo reverses all sub-commands (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`batch undo calls ${n} undo fns in reverse [${i}]`, () => {
        const order: number[] = [];
        const cmds = Array.from({ length: n }, (_, j) =>
          createCommand(() => j, () => order.push(j))
        );
        const b = batch(cmds);
        b.execute();
        b.undo!();
        const expected = Array.from({ length: n }, (_, j) => n - 1 - j);
        expect(order).toEqual(expected);
      });
    }
  });
});

// ============================================================
// Section 7: when (100 tests)
// ============================================================
describe('when', () => {
  describe('condition true: executes command (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      it(`when(true) returns execute result ${i} [${i}]`, () => {
        const cmd = createCommand(() => i);
        const w = when(true, cmd);
        expect(w.execute()).toBe(i);
      });
    }
  });

  describe('condition false: returns undefined (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      it(`when(false) returns undefined and does not call fn [${i}]`, () => {
        const fn = jest.fn(() => i);
        const cmd = createCommand(fn);
        const w = when(false, cmd);
        expect(w.execute()).toBeUndefined();
        expect(fn).not.toHaveBeenCalled();
      });
    }
  });
});

// ============================================================
// Section 8: withRetry (100 tests)
// ============================================================
describe('withRetry', () => {
  describe('succeeds on first attempt (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const maxAttempts = (i % 5) + 1;
      it(`withRetry(maxAttempts=${maxAttempts}) returns ${i} immediately [${i}]`, () => {
        const cmd = createCommand(() => i);
        const r = withRetry(cmd, maxAttempts);
        expect(r.execute()).toBe(i);
      });
    }
  });

  describe('retries on transient failure then succeeds (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const maxAttempts = (i % 3) + 2;
      const failCount = maxAttempts - 1;
      it(`withRetry fails ${failCount} times then succeeds (maxAttempts=${maxAttempts}) [${i}]`, () => {
        let calls = 0;
        const cmd = createCommand(() => {
          calls++;
          if (calls < maxAttempts) throw new Error('transient');
          return i;
        });
        const r = withRetry(cmd, maxAttempts);
        expect(r.execute()).toBe(i);
        expect(calls).toBe(maxAttempts);
      });
    }
  });
});

// ============================================================
// Section 9: CommandHistory.clear and edge cases (100 tests)
// ============================================================
describe('CommandHistory.clear and edge cases', () => {
  describe('clear resets history and future (50 tests)', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i % 5) + 1;
      it(`clear after ${n} executes resets state [${i}]`, () => {
        const h = createCommandHistory<number>();
        for (let k = 0; k < n; k++) h.execute(createCommand(() => k));
        h.clear();
        expect(h.history()).toHaveLength(0);
        expect(h.future()).toHaveLength(0);
        expect(h.canUndo()).toBe(false);
        expect(h.canRedo()).toBe(false);
      });
    }
  });

  describe('undo on empty history is no-op (25 tests)', () => {
    for (let i = 0; i < 25; i++) {
      it(`undo on empty history does not throw [${i}]`, () => {
        const h = createCommandHistory();
        expect(() => h.undo()).not.toThrow();
        expect(h.canUndo()).toBe(false);
      });
    }
  });

  describe('redo on empty future is no-op (25 tests)', () => {
    for (let i = 0; i < 25; i++) {
      it(`redo on empty future does not throw [${i}]`, () => {
        const h = createCommandHistory();
        expect(() => h.redo()).not.toThrow();
        expect(h.canRedo()).toBe(false);
      });
    }
  });
});
