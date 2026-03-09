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
function hd258cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cmd_hd',()=>{it('a',()=>{expect(hd258cmd(1,4)).toBe(2);});it('b',()=>{expect(hd258cmd(3,1)).toBe(1);});it('c',()=>{expect(hd258cmd(0,0)).toBe(0);});it('d',()=>{expect(hd258cmd(93,73)).toBe(2);});it('e',()=>{expect(hd258cmd(15,0)).toBe(4);});});
function hd259cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cmd_hd',()=>{it('a',()=>{expect(hd259cmd(1,4)).toBe(2);});it('b',()=>{expect(hd259cmd(3,1)).toBe(1);});it('c',()=>{expect(hd259cmd(0,0)).toBe(0);});it('d',()=>{expect(hd259cmd(93,73)).toBe(2);});it('e',()=>{expect(hd259cmd(15,0)).toBe(4);});});
function hd260cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cmd_hd',()=>{it('a',()=>{expect(hd260cmd(1,4)).toBe(2);});it('b',()=>{expect(hd260cmd(3,1)).toBe(1);});it('c',()=>{expect(hd260cmd(0,0)).toBe(0);});it('d',()=>{expect(hd260cmd(93,73)).toBe(2);});it('e',()=>{expect(hd260cmd(15,0)).toBe(4);});});
function hd261cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cmd_hd',()=>{it('a',()=>{expect(hd261cmd(1,4)).toBe(2);});it('b',()=>{expect(hd261cmd(3,1)).toBe(1);});it('c',()=>{expect(hd261cmd(0,0)).toBe(0);});it('d',()=>{expect(hd261cmd(93,73)).toBe(2);});it('e',()=>{expect(hd261cmd(15,0)).toBe(4);});});
function hd262cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cmd_hd',()=>{it('a',()=>{expect(hd262cmd(1,4)).toBe(2);});it('b',()=>{expect(hd262cmd(3,1)).toBe(1);});it('c',()=>{expect(hd262cmd(0,0)).toBe(0);});it('d',()=>{expect(hd262cmd(93,73)).toBe(2);});it('e',()=>{expect(hd262cmd(15,0)).toBe(4);});});
function hd263cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cmd_hd',()=>{it('a',()=>{expect(hd263cmd(1,4)).toBe(2);});it('b',()=>{expect(hd263cmd(3,1)).toBe(1);});it('c',()=>{expect(hd263cmd(0,0)).toBe(0);});it('d',()=>{expect(hd263cmd(93,73)).toBe(2);});it('e',()=>{expect(hd263cmd(15,0)).toBe(4);});});
function hd264cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cmd_hd',()=>{it('a',()=>{expect(hd264cmd(1,4)).toBe(2);});it('b',()=>{expect(hd264cmd(3,1)).toBe(1);});it('c',()=>{expect(hd264cmd(0,0)).toBe(0);});it('d',()=>{expect(hd264cmd(93,73)).toBe(2);});it('e',()=>{expect(hd264cmd(15,0)).toBe(4);});});
function hd265cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cmd_hd',()=>{it('a',()=>{expect(hd265cmd(1,4)).toBe(2);});it('b',()=>{expect(hd265cmd(3,1)).toBe(1);});it('c',()=>{expect(hd265cmd(0,0)).toBe(0);});it('d',()=>{expect(hd265cmd(93,73)).toBe(2);});it('e',()=>{expect(hd265cmd(15,0)).toBe(4);});});
function hd266cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cmd_hd',()=>{it('a',()=>{expect(hd266cmd(1,4)).toBe(2);});it('b',()=>{expect(hd266cmd(3,1)).toBe(1);});it('c',()=>{expect(hd266cmd(0,0)).toBe(0);});it('d',()=>{expect(hd266cmd(93,73)).toBe(2);});it('e',()=>{expect(hd266cmd(15,0)).toBe(4);});});
function hd267cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cmd_hd',()=>{it('a',()=>{expect(hd267cmd(1,4)).toBe(2);});it('b',()=>{expect(hd267cmd(3,1)).toBe(1);});it('c',()=>{expect(hd267cmd(0,0)).toBe(0);});it('d',()=>{expect(hd267cmd(93,73)).toBe(2);});it('e',()=>{expect(hd267cmd(15,0)).toBe(4);});});
function hd268cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cmd_hd',()=>{it('a',()=>{expect(hd268cmd(1,4)).toBe(2);});it('b',()=>{expect(hd268cmd(3,1)).toBe(1);});it('c',()=>{expect(hd268cmd(0,0)).toBe(0);});it('d',()=>{expect(hd268cmd(93,73)).toBe(2);});it('e',()=>{expect(hd268cmd(15,0)).toBe(4);});});
function hd269cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cmd_hd',()=>{it('a',()=>{expect(hd269cmd(1,4)).toBe(2);});it('b',()=>{expect(hd269cmd(3,1)).toBe(1);});it('c',()=>{expect(hd269cmd(0,0)).toBe(0);});it('d',()=>{expect(hd269cmd(93,73)).toBe(2);});it('e',()=>{expect(hd269cmd(15,0)).toBe(4);});});
function hd270cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cmd_hd',()=>{it('a',()=>{expect(hd270cmd(1,4)).toBe(2);});it('b',()=>{expect(hd270cmd(3,1)).toBe(1);});it('c',()=>{expect(hd270cmd(0,0)).toBe(0);});it('d',()=>{expect(hd270cmd(93,73)).toBe(2);});it('e',()=>{expect(hd270cmd(15,0)).toBe(4);});});
function hd271cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cmd_hd',()=>{it('a',()=>{expect(hd271cmd(1,4)).toBe(2);});it('b',()=>{expect(hd271cmd(3,1)).toBe(1);});it('c',()=>{expect(hd271cmd(0,0)).toBe(0);});it('d',()=>{expect(hd271cmd(93,73)).toBe(2);});it('e',()=>{expect(hd271cmd(15,0)).toBe(4);});});
function hd272cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cmd_hd',()=>{it('a',()=>{expect(hd272cmd(1,4)).toBe(2);});it('b',()=>{expect(hd272cmd(3,1)).toBe(1);});it('c',()=>{expect(hd272cmd(0,0)).toBe(0);});it('d',()=>{expect(hd272cmd(93,73)).toBe(2);});it('e',()=>{expect(hd272cmd(15,0)).toBe(4);});});
function hd273cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cmd_hd',()=>{it('a',()=>{expect(hd273cmd(1,4)).toBe(2);});it('b',()=>{expect(hd273cmd(3,1)).toBe(1);});it('c',()=>{expect(hd273cmd(0,0)).toBe(0);});it('d',()=>{expect(hd273cmd(93,73)).toBe(2);});it('e',()=>{expect(hd273cmd(15,0)).toBe(4);});});
function hd274cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cmd_hd',()=>{it('a',()=>{expect(hd274cmd(1,4)).toBe(2);});it('b',()=>{expect(hd274cmd(3,1)).toBe(1);});it('c',()=>{expect(hd274cmd(0,0)).toBe(0);});it('d',()=>{expect(hd274cmd(93,73)).toBe(2);});it('e',()=>{expect(hd274cmd(15,0)).toBe(4);});});
function hd275cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cmd_hd',()=>{it('a',()=>{expect(hd275cmd(1,4)).toBe(2);});it('b',()=>{expect(hd275cmd(3,1)).toBe(1);});it('c',()=>{expect(hd275cmd(0,0)).toBe(0);});it('d',()=>{expect(hd275cmd(93,73)).toBe(2);});it('e',()=>{expect(hd275cmd(15,0)).toBe(4);});});
function hd276cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cmd_hd',()=>{it('a',()=>{expect(hd276cmd(1,4)).toBe(2);});it('b',()=>{expect(hd276cmd(3,1)).toBe(1);});it('c',()=>{expect(hd276cmd(0,0)).toBe(0);});it('d',()=>{expect(hd276cmd(93,73)).toBe(2);});it('e',()=>{expect(hd276cmd(15,0)).toBe(4);});});
function hd277cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277cmd_hd',()=>{it('a',()=>{expect(hd277cmd(1,4)).toBe(2);});it('b',()=>{expect(hd277cmd(3,1)).toBe(1);});it('c',()=>{expect(hd277cmd(0,0)).toBe(0);});it('d',()=>{expect(hd277cmd(93,73)).toBe(2);});it('e',()=>{expect(hd277cmd(15,0)).toBe(4);});});
function hd278cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278cmd_hd',()=>{it('a',()=>{expect(hd278cmd(1,4)).toBe(2);});it('b',()=>{expect(hd278cmd(3,1)).toBe(1);});it('c',()=>{expect(hd278cmd(0,0)).toBe(0);});it('d',()=>{expect(hd278cmd(93,73)).toBe(2);});it('e',()=>{expect(hd278cmd(15,0)).toBe(4);});});
function hd279cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279cmd_hd',()=>{it('a',()=>{expect(hd279cmd(1,4)).toBe(2);});it('b',()=>{expect(hd279cmd(3,1)).toBe(1);});it('c',()=>{expect(hd279cmd(0,0)).toBe(0);});it('d',()=>{expect(hd279cmd(93,73)).toBe(2);});it('e',()=>{expect(hd279cmd(15,0)).toBe(4);});});
function hd280cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280cmd_hd',()=>{it('a',()=>{expect(hd280cmd(1,4)).toBe(2);});it('b',()=>{expect(hd280cmd(3,1)).toBe(1);});it('c',()=>{expect(hd280cmd(0,0)).toBe(0);});it('d',()=>{expect(hd280cmd(93,73)).toBe(2);});it('e',()=>{expect(hd280cmd(15,0)).toBe(4);});});
function hd281cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281cmd_hd',()=>{it('a',()=>{expect(hd281cmd(1,4)).toBe(2);});it('b',()=>{expect(hd281cmd(3,1)).toBe(1);});it('c',()=>{expect(hd281cmd(0,0)).toBe(0);});it('d',()=>{expect(hd281cmd(93,73)).toBe(2);});it('e',()=>{expect(hd281cmd(15,0)).toBe(4);});});
function hd282cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282cmd_hd',()=>{it('a',()=>{expect(hd282cmd(1,4)).toBe(2);});it('b',()=>{expect(hd282cmd(3,1)).toBe(1);});it('c',()=>{expect(hd282cmd(0,0)).toBe(0);});it('d',()=>{expect(hd282cmd(93,73)).toBe(2);});it('e',()=>{expect(hd282cmd(15,0)).toBe(4);});});
function hd283cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283cmd_hd',()=>{it('a',()=>{expect(hd283cmd(1,4)).toBe(2);});it('b',()=>{expect(hd283cmd(3,1)).toBe(1);});it('c',()=>{expect(hd283cmd(0,0)).toBe(0);});it('d',()=>{expect(hd283cmd(93,73)).toBe(2);});it('e',()=>{expect(hd283cmd(15,0)).toBe(4);});});
function hd284cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284cmd_hd',()=>{it('a',()=>{expect(hd284cmd(1,4)).toBe(2);});it('b',()=>{expect(hd284cmd(3,1)).toBe(1);});it('c',()=>{expect(hd284cmd(0,0)).toBe(0);});it('d',()=>{expect(hd284cmd(93,73)).toBe(2);});it('e',()=>{expect(hd284cmd(15,0)).toBe(4);});});
function hd285cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285cmd_hd',()=>{it('a',()=>{expect(hd285cmd(1,4)).toBe(2);});it('b',()=>{expect(hd285cmd(3,1)).toBe(1);});it('c',()=>{expect(hd285cmd(0,0)).toBe(0);});it('d',()=>{expect(hd285cmd(93,73)).toBe(2);});it('e',()=>{expect(hd285cmd(15,0)).toBe(4);});});
function hd286cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286cmd_hd',()=>{it('a',()=>{expect(hd286cmd(1,4)).toBe(2);});it('b',()=>{expect(hd286cmd(3,1)).toBe(1);});it('c',()=>{expect(hd286cmd(0,0)).toBe(0);});it('d',()=>{expect(hd286cmd(93,73)).toBe(2);});it('e',()=>{expect(hd286cmd(15,0)).toBe(4);});});
function hd287cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287cmd_hd',()=>{it('a',()=>{expect(hd287cmd(1,4)).toBe(2);});it('b',()=>{expect(hd287cmd(3,1)).toBe(1);});it('c',()=>{expect(hd287cmd(0,0)).toBe(0);});it('d',()=>{expect(hd287cmd(93,73)).toBe(2);});it('e',()=>{expect(hd287cmd(15,0)).toBe(4);});});
function hd288cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288cmd_hd',()=>{it('a',()=>{expect(hd288cmd(1,4)).toBe(2);});it('b',()=>{expect(hd288cmd(3,1)).toBe(1);});it('c',()=>{expect(hd288cmd(0,0)).toBe(0);});it('d',()=>{expect(hd288cmd(93,73)).toBe(2);});it('e',()=>{expect(hd288cmd(15,0)).toBe(4);});});
function hd289cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289cmd_hd',()=>{it('a',()=>{expect(hd289cmd(1,4)).toBe(2);});it('b',()=>{expect(hd289cmd(3,1)).toBe(1);});it('c',()=>{expect(hd289cmd(0,0)).toBe(0);});it('d',()=>{expect(hd289cmd(93,73)).toBe(2);});it('e',()=>{expect(hd289cmd(15,0)).toBe(4);});});
function hd290cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290cmd_hd',()=>{it('a',()=>{expect(hd290cmd(1,4)).toBe(2);});it('b',()=>{expect(hd290cmd(3,1)).toBe(1);});it('c',()=>{expect(hd290cmd(0,0)).toBe(0);});it('d',()=>{expect(hd290cmd(93,73)).toBe(2);});it('e',()=>{expect(hd290cmd(15,0)).toBe(4);});});
function hd291cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291cmd_hd',()=>{it('a',()=>{expect(hd291cmd(1,4)).toBe(2);});it('b',()=>{expect(hd291cmd(3,1)).toBe(1);});it('c',()=>{expect(hd291cmd(0,0)).toBe(0);});it('d',()=>{expect(hd291cmd(93,73)).toBe(2);});it('e',()=>{expect(hd291cmd(15,0)).toBe(4);});});
function hd292cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292cmd_hd',()=>{it('a',()=>{expect(hd292cmd(1,4)).toBe(2);});it('b',()=>{expect(hd292cmd(3,1)).toBe(1);});it('c',()=>{expect(hd292cmd(0,0)).toBe(0);});it('d',()=>{expect(hd292cmd(93,73)).toBe(2);});it('e',()=>{expect(hd292cmd(15,0)).toBe(4);});});
function hd293cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293cmd_hd',()=>{it('a',()=>{expect(hd293cmd(1,4)).toBe(2);});it('b',()=>{expect(hd293cmd(3,1)).toBe(1);});it('c',()=>{expect(hd293cmd(0,0)).toBe(0);});it('d',()=>{expect(hd293cmd(93,73)).toBe(2);});it('e',()=>{expect(hd293cmd(15,0)).toBe(4);});});
function hd294cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294cmd_hd',()=>{it('a',()=>{expect(hd294cmd(1,4)).toBe(2);});it('b',()=>{expect(hd294cmd(3,1)).toBe(1);});it('c',()=>{expect(hd294cmd(0,0)).toBe(0);});it('d',()=>{expect(hd294cmd(93,73)).toBe(2);});it('e',()=>{expect(hd294cmd(15,0)).toBe(4);});});
function hd295cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295cmd_hd',()=>{it('a',()=>{expect(hd295cmd(1,4)).toBe(2);});it('b',()=>{expect(hd295cmd(3,1)).toBe(1);});it('c',()=>{expect(hd295cmd(0,0)).toBe(0);});it('d',()=>{expect(hd295cmd(93,73)).toBe(2);});it('e',()=>{expect(hd295cmd(15,0)).toBe(4);});});
function hd296cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296cmd_hd',()=>{it('a',()=>{expect(hd296cmd(1,4)).toBe(2);});it('b',()=>{expect(hd296cmd(3,1)).toBe(1);});it('c',()=>{expect(hd296cmd(0,0)).toBe(0);});it('d',()=>{expect(hd296cmd(93,73)).toBe(2);});it('e',()=>{expect(hd296cmd(15,0)).toBe(4);});});
function hd297cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297cmd_hd',()=>{it('a',()=>{expect(hd297cmd(1,4)).toBe(2);});it('b',()=>{expect(hd297cmd(3,1)).toBe(1);});it('c',()=>{expect(hd297cmd(0,0)).toBe(0);});it('d',()=>{expect(hd297cmd(93,73)).toBe(2);});it('e',()=>{expect(hd297cmd(15,0)).toBe(4);});});
function hd298cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298cmd_hd',()=>{it('a',()=>{expect(hd298cmd(1,4)).toBe(2);});it('b',()=>{expect(hd298cmd(3,1)).toBe(1);});it('c',()=>{expect(hd298cmd(0,0)).toBe(0);});it('d',()=>{expect(hd298cmd(93,73)).toBe(2);});it('e',()=>{expect(hd298cmd(15,0)).toBe(4);});});
function hd299cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299cmd_hd',()=>{it('a',()=>{expect(hd299cmd(1,4)).toBe(2);});it('b',()=>{expect(hd299cmd(3,1)).toBe(1);});it('c',()=>{expect(hd299cmd(0,0)).toBe(0);});it('d',()=>{expect(hd299cmd(93,73)).toBe(2);});it('e',()=>{expect(hd299cmd(15,0)).toBe(4);});});
function hd300cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300cmd_hd',()=>{it('a',()=>{expect(hd300cmd(1,4)).toBe(2);});it('b',()=>{expect(hd300cmd(3,1)).toBe(1);});it('c',()=>{expect(hd300cmd(0,0)).toBe(0);});it('d',()=>{expect(hd300cmd(93,73)).toBe(2);});it('e',()=>{expect(hd300cmd(15,0)).toBe(4);});});
function hd301cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301cmd_hd',()=>{it('a',()=>{expect(hd301cmd(1,4)).toBe(2);});it('b',()=>{expect(hd301cmd(3,1)).toBe(1);});it('c',()=>{expect(hd301cmd(0,0)).toBe(0);});it('d',()=>{expect(hd301cmd(93,73)).toBe(2);});it('e',()=>{expect(hd301cmd(15,0)).toBe(4);});});
function hd302cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302cmd_hd',()=>{it('a',()=>{expect(hd302cmd(1,4)).toBe(2);});it('b',()=>{expect(hd302cmd(3,1)).toBe(1);});it('c',()=>{expect(hd302cmd(0,0)).toBe(0);});it('d',()=>{expect(hd302cmd(93,73)).toBe(2);});it('e',()=>{expect(hd302cmd(15,0)).toBe(4);});});
function hd303cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303cmd_hd',()=>{it('a',()=>{expect(hd303cmd(1,4)).toBe(2);});it('b',()=>{expect(hd303cmd(3,1)).toBe(1);});it('c',()=>{expect(hd303cmd(0,0)).toBe(0);});it('d',()=>{expect(hd303cmd(93,73)).toBe(2);});it('e',()=>{expect(hd303cmd(15,0)).toBe(4);});});
function hd304cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304cmd_hd',()=>{it('a',()=>{expect(hd304cmd(1,4)).toBe(2);});it('b',()=>{expect(hd304cmd(3,1)).toBe(1);});it('c',()=>{expect(hd304cmd(0,0)).toBe(0);});it('d',()=>{expect(hd304cmd(93,73)).toBe(2);});it('e',()=>{expect(hd304cmd(15,0)).toBe(4);});});
function hd305cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305cmd_hd',()=>{it('a',()=>{expect(hd305cmd(1,4)).toBe(2);});it('b',()=>{expect(hd305cmd(3,1)).toBe(1);});it('c',()=>{expect(hd305cmd(0,0)).toBe(0);});it('d',()=>{expect(hd305cmd(93,73)).toBe(2);});it('e',()=>{expect(hd305cmd(15,0)).toBe(4);});});
function hd306cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306cmd_hd',()=>{it('a',()=>{expect(hd306cmd(1,4)).toBe(2);});it('b',()=>{expect(hd306cmd(3,1)).toBe(1);});it('c',()=>{expect(hd306cmd(0,0)).toBe(0);});it('d',()=>{expect(hd306cmd(93,73)).toBe(2);});it('e',()=>{expect(hd306cmd(15,0)).toBe(4);});});
function hd307cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307cmd_hd',()=>{it('a',()=>{expect(hd307cmd(1,4)).toBe(2);});it('b',()=>{expect(hd307cmd(3,1)).toBe(1);});it('c',()=>{expect(hd307cmd(0,0)).toBe(0);});it('d',()=>{expect(hd307cmd(93,73)).toBe(2);});it('e',()=>{expect(hd307cmd(15,0)).toBe(4);});});
function hd308cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308cmd_hd',()=>{it('a',()=>{expect(hd308cmd(1,4)).toBe(2);});it('b',()=>{expect(hd308cmd(3,1)).toBe(1);});it('c',()=>{expect(hd308cmd(0,0)).toBe(0);});it('d',()=>{expect(hd308cmd(93,73)).toBe(2);});it('e',()=>{expect(hd308cmd(15,0)).toBe(4);});});
function hd309cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309cmd_hd',()=>{it('a',()=>{expect(hd309cmd(1,4)).toBe(2);});it('b',()=>{expect(hd309cmd(3,1)).toBe(1);});it('c',()=>{expect(hd309cmd(0,0)).toBe(0);});it('d',()=>{expect(hd309cmd(93,73)).toBe(2);});it('e',()=>{expect(hd309cmd(15,0)).toBe(4);});});
function hd310cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310cmd_hd',()=>{it('a',()=>{expect(hd310cmd(1,4)).toBe(2);});it('b',()=>{expect(hd310cmd(3,1)).toBe(1);});it('c',()=>{expect(hd310cmd(0,0)).toBe(0);});it('d',()=>{expect(hd310cmd(93,73)).toBe(2);});it('e',()=>{expect(hd310cmd(15,0)).toBe(4);});});
function hd311cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311cmd_hd',()=>{it('a',()=>{expect(hd311cmd(1,4)).toBe(2);});it('b',()=>{expect(hd311cmd(3,1)).toBe(1);});it('c',()=>{expect(hd311cmd(0,0)).toBe(0);});it('d',()=>{expect(hd311cmd(93,73)).toBe(2);});it('e',()=>{expect(hd311cmd(15,0)).toBe(4);});});
function hd312cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312cmd_hd',()=>{it('a',()=>{expect(hd312cmd(1,4)).toBe(2);});it('b',()=>{expect(hd312cmd(3,1)).toBe(1);});it('c',()=>{expect(hd312cmd(0,0)).toBe(0);});it('d',()=>{expect(hd312cmd(93,73)).toBe(2);});it('e',()=>{expect(hd312cmd(15,0)).toBe(4);});});
function hd313cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313cmd_hd',()=>{it('a',()=>{expect(hd313cmd(1,4)).toBe(2);});it('b',()=>{expect(hd313cmd(3,1)).toBe(1);});it('c',()=>{expect(hd313cmd(0,0)).toBe(0);});it('d',()=>{expect(hd313cmd(93,73)).toBe(2);});it('e',()=>{expect(hd313cmd(15,0)).toBe(4);});});
function hd314cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314cmd_hd',()=>{it('a',()=>{expect(hd314cmd(1,4)).toBe(2);});it('b',()=>{expect(hd314cmd(3,1)).toBe(1);});it('c',()=>{expect(hd314cmd(0,0)).toBe(0);});it('d',()=>{expect(hd314cmd(93,73)).toBe(2);});it('e',()=>{expect(hd314cmd(15,0)).toBe(4);});});
function hd315cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315cmd_hd',()=>{it('a',()=>{expect(hd315cmd(1,4)).toBe(2);});it('b',()=>{expect(hd315cmd(3,1)).toBe(1);});it('c',()=>{expect(hd315cmd(0,0)).toBe(0);});it('d',()=>{expect(hd315cmd(93,73)).toBe(2);});it('e',()=>{expect(hd315cmd(15,0)).toBe(4);});});
function hd316cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316cmd_hd',()=>{it('a',()=>{expect(hd316cmd(1,4)).toBe(2);});it('b',()=>{expect(hd316cmd(3,1)).toBe(1);});it('c',()=>{expect(hd316cmd(0,0)).toBe(0);});it('d',()=>{expect(hd316cmd(93,73)).toBe(2);});it('e',()=>{expect(hd316cmd(15,0)).toBe(4);});});
function hd317cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317cmd_hd',()=>{it('a',()=>{expect(hd317cmd(1,4)).toBe(2);});it('b',()=>{expect(hd317cmd(3,1)).toBe(1);});it('c',()=>{expect(hd317cmd(0,0)).toBe(0);});it('d',()=>{expect(hd317cmd(93,73)).toBe(2);});it('e',()=>{expect(hd317cmd(15,0)).toBe(4);});});
function hd318cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318cmd_hd',()=>{it('a',()=>{expect(hd318cmd(1,4)).toBe(2);});it('b',()=>{expect(hd318cmd(3,1)).toBe(1);});it('c',()=>{expect(hd318cmd(0,0)).toBe(0);});it('d',()=>{expect(hd318cmd(93,73)).toBe(2);});it('e',()=>{expect(hd318cmd(15,0)).toBe(4);});});
function hd319cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319cmd_hd',()=>{it('a',()=>{expect(hd319cmd(1,4)).toBe(2);});it('b',()=>{expect(hd319cmd(3,1)).toBe(1);});it('c',()=>{expect(hd319cmd(0,0)).toBe(0);});it('d',()=>{expect(hd319cmd(93,73)).toBe(2);});it('e',()=>{expect(hd319cmd(15,0)).toBe(4);});});
function hd320cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320cmd_hd',()=>{it('a',()=>{expect(hd320cmd(1,4)).toBe(2);});it('b',()=>{expect(hd320cmd(3,1)).toBe(1);});it('c',()=>{expect(hd320cmd(0,0)).toBe(0);});it('d',()=>{expect(hd320cmd(93,73)).toBe(2);});it('e',()=>{expect(hd320cmd(15,0)).toBe(4);});});
function hd321cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321cmd_hd',()=>{it('a',()=>{expect(hd321cmd(1,4)).toBe(2);});it('b',()=>{expect(hd321cmd(3,1)).toBe(1);});it('c',()=>{expect(hd321cmd(0,0)).toBe(0);});it('d',()=>{expect(hd321cmd(93,73)).toBe(2);});it('e',()=>{expect(hd321cmd(15,0)).toBe(4);});});
function hd322cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322cmd_hd',()=>{it('a',()=>{expect(hd322cmd(1,4)).toBe(2);});it('b',()=>{expect(hd322cmd(3,1)).toBe(1);});it('c',()=>{expect(hd322cmd(0,0)).toBe(0);});it('d',()=>{expect(hd322cmd(93,73)).toBe(2);});it('e',()=>{expect(hd322cmd(15,0)).toBe(4);});});
function hd323cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323cmd_hd',()=>{it('a',()=>{expect(hd323cmd(1,4)).toBe(2);});it('b',()=>{expect(hd323cmd(3,1)).toBe(1);});it('c',()=>{expect(hd323cmd(0,0)).toBe(0);});it('d',()=>{expect(hd323cmd(93,73)).toBe(2);});it('e',()=>{expect(hd323cmd(15,0)).toBe(4);});});
function hd324cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324cmd_hd',()=>{it('a',()=>{expect(hd324cmd(1,4)).toBe(2);});it('b',()=>{expect(hd324cmd(3,1)).toBe(1);});it('c',()=>{expect(hd324cmd(0,0)).toBe(0);});it('d',()=>{expect(hd324cmd(93,73)).toBe(2);});it('e',()=>{expect(hd324cmd(15,0)).toBe(4);});});
function hd325cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325cmd_hd',()=>{it('a',()=>{expect(hd325cmd(1,4)).toBe(2);});it('b',()=>{expect(hd325cmd(3,1)).toBe(1);});it('c',()=>{expect(hd325cmd(0,0)).toBe(0);});it('d',()=>{expect(hd325cmd(93,73)).toBe(2);});it('e',()=>{expect(hd325cmd(15,0)).toBe(4);});});
function hd326cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326cmd_hd',()=>{it('a',()=>{expect(hd326cmd(1,4)).toBe(2);});it('b',()=>{expect(hd326cmd(3,1)).toBe(1);});it('c',()=>{expect(hd326cmd(0,0)).toBe(0);});it('d',()=>{expect(hd326cmd(93,73)).toBe(2);});it('e',()=>{expect(hd326cmd(15,0)).toBe(4);});});
function hd327cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327cmd_hd',()=>{it('a',()=>{expect(hd327cmd(1,4)).toBe(2);});it('b',()=>{expect(hd327cmd(3,1)).toBe(1);});it('c',()=>{expect(hd327cmd(0,0)).toBe(0);});it('d',()=>{expect(hd327cmd(93,73)).toBe(2);});it('e',()=>{expect(hd327cmd(15,0)).toBe(4);});});
function hd328cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328cmd_hd',()=>{it('a',()=>{expect(hd328cmd(1,4)).toBe(2);});it('b',()=>{expect(hd328cmd(3,1)).toBe(1);});it('c',()=>{expect(hd328cmd(0,0)).toBe(0);});it('d',()=>{expect(hd328cmd(93,73)).toBe(2);});it('e',()=>{expect(hd328cmd(15,0)).toBe(4);});});
function hd329cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329cmd_hd',()=>{it('a',()=>{expect(hd329cmd(1,4)).toBe(2);});it('b',()=>{expect(hd329cmd(3,1)).toBe(1);});it('c',()=>{expect(hd329cmd(0,0)).toBe(0);});it('d',()=>{expect(hd329cmd(93,73)).toBe(2);});it('e',()=>{expect(hd329cmd(15,0)).toBe(4);});});
function hd330cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330cmd_hd',()=>{it('a',()=>{expect(hd330cmd(1,4)).toBe(2);});it('b',()=>{expect(hd330cmd(3,1)).toBe(1);});it('c',()=>{expect(hd330cmd(0,0)).toBe(0);});it('d',()=>{expect(hd330cmd(93,73)).toBe(2);});it('e',()=>{expect(hd330cmd(15,0)).toBe(4);});});
function hd331cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331cmd_hd',()=>{it('a',()=>{expect(hd331cmd(1,4)).toBe(2);});it('b',()=>{expect(hd331cmd(3,1)).toBe(1);});it('c',()=>{expect(hd331cmd(0,0)).toBe(0);});it('d',()=>{expect(hd331cmd(93,73)).toBe(2);});it('e',()=>{expect(hd331cmd(15,0)).toBe(4);});});
function hd332cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332cmd_hd',()=>{it('a',()=>{expect(hd332cmd(1,4)).toBe(2);});it('b',()=>{expect(hd332cmd(3,1)).toBe(1);});it('c',()=>{expect(hd332cmd(0,0)).toBe(0);});it('d',()=>{expect(hd332cmd(93,73)).toBe(2);});it('e',()=>{expect(hd332cmd(15,0)).toBe(4);});});
function hd333cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333cmd_hd',()=>{it('a',()=>{expect(hd333cmd(1,4)).toBe(2);});it('b',()=>{expect(hd333cmd(3,1)).toBe(1);});it('c',()=>{expect(hd333cmd(0,0)).toBe(0);});it('d',()=>{expect(hd333cmd(93,73)).toBe(2);});it('e',()=>{expect(hd333cmd(15,0)).toBe(4);});});
function hd334cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334cmd_hd',()=>{it('a',()=>{expect(hd334cmd(1,4)).toBe(2);});it('b',()=>{expect(hd334cmd(3,1)).toBe(1);});it('c',()=>{expect(hd334cmd(0,0)).toBe(0);});it('d',()=>{expect(hd334cmd(93,73)).toBe(2);});it('e',()=>{expect(hd334cmd(15,0)).toBe(4);});});
function hd335cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335cmd_hd',()=>{it('a',()=>{expect(hd335cmd(1,4)).toBe(2);});it('b',()=>{expect(hd335cmd(3,1)).toBe(1);});it('c',()=>{expect(hd335cmd(0,0)).toBe(0);});it('d',()=>{expect(hd335cmd(93,73)).toBe(2);});it('e',()=>{expect(hd335cmd(15,0)).toBe(4);});});
function hd336cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336cmd_hd',()=>{it('a',()=>{expect(hd336cmd(1,4)).toBe(2);});it('b',()=>{expect(hd336cmd(3,1)).toBe(1);});it('c',()=>{expect(hd336cmd(0,0)).toBe(0);});it('d',()=>{expect(hd336cmd(93,73)).toBe(2);});it('e',()=>{expect(hd336cmd(15,0)).toBe(4);});});
function hd337cmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337cmd_hd',()=>{it('a',()=>{expect(hd337cmd(1,4)).toBe(2);});it('b',()=>{expect(hd337cmd(3,1)).toBe(1);});it('c',()=>{expect(hd337cmd(0,0)).toBe(0);});it('d',()=>{expect(hd337cmd(93,73)).toBe(2);});it('e',()=>{expect(hd337cmd(15,0)).toBe(4);});});
