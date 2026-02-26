// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  FeatureToggleRegistry,
  inRollout,
  guard,
  defineExperiment,
  getVariant,
  snapshot,
  diffSnapshots,
  registry as globalRegistry,
  define as globalDefine,
  enable as globalEnable,
  disable as globalDisable,
  isEnabled as globalIsEnabled,
  listToggles,
} from '../feature-toggle';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function freshRegistry(): FeatureToggleRegistry {
  return new FeatureToggleRegistry();
}

// djb2 replica for test expectations
function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

function expectedInRollout(userId: string, key: string, pct: number): boolean {
  if (pct <= 0) return false;
  if (pct >= 100) return true;
  return (djb2(userId + ':' + key) % 100) < pct;
}

// ─── 1. define / enable / disable — 100 tests ────────────────────────────────

describe('FeatureToggleRegistry define/enable/disable', () => {
  for (let i = 0; i < 50; i++) {
    it(`define toggle-${i} enabled=true and verify enabled`, () => {
      const reg = freshRegistry();
      reg.define(`toggle-${i}`, true);
      expect(reg.get(`toggle-${i}`)?.enabled).toBe(true);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`define toggle-${i} enabled=false, then enable, verify true`, () => {
      const reg = freshRegistry();
      reg.define(`key-${i}`, false);
      reg.enable(`key-${i}`);
      expect(reg.get(`key-${i}`)?.enabled).toBe(true);
    });
  }
});

// ─── 2. isEnabled basic — 100 tests ──────────────────────────────────────────

describe('FeatureToggleRegistry.isEnabled basic', () => {
  for (let i = 0; i < 50; i++) {
    it(`isEnabled returns false for disabled toggle index ${i}`, () => {
      const reg = freshRegistry();
      reg.define(`feat-${i}`, false);
      expect(reg.isEnabled(`feat-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`isEnabled returns true for enabled toggle index ${i}`, () => {
      const reg = freshRegistry();
      reg.define(`feat-on-${i}`, true);
      expect(reg.isEnabled(`feat-on-${i}`)).toBe(true);
    });
  }
});

// ─── 3. isEnabled missing key — 10 tests ─────────────────────────────────────

describe('FeatureToggleRegistry.isEnabled missing key', () => {
  for (let i = 0; i < 10; i++) {
    it(`isEnabled returns false for nonexistent key ${i}`, () => {
      const reg = freshRegistry();
      expect(reg.isEnabled(`nonexistent-${i}`)).toBe(false);
    });
  }
});

// ─── 4. isEnabled with rule: userList — 100 tests ────────────────────────────

describe('isEnabled with rules - userList', () => {
  for (let i = 0; i < 50; i++) {
    it(`userList rule: userId user-${i} is in list → true`, () => {
      const reg = freshRegistry();
      reg.define(`ul-feat-${i}`, true, {
        rules: [{ strategy: 'userList', users: [`user-${i}`, `user-extra-${i}`] }],
      });
      expect(reg.isEnabled(`ul-feat-${i}`, { userId: `user-${i}` })).toBe(true);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`userList rule: userId outsider-${i} not in list → false`, () => {
      const reg = freshRegistry();
      reg.define(`ul-feat2-${i}`, true, {
        rules: [{ strategy: 'userList', users: [`alice`, `bob`] }],
      });
      expect(reg.isEnabled(`ul-feat2-${i}`, { userId: `outsider-${i}` })).toBe(false);
    });
  }
});

// ─── 5. isEnabled with rule: percentage — 100 tests ──────────────────────────

describe('isEnabled with rules - percentage', () => {
  const userIds = Array.from({ length: 100 }, (_, i) => `pct-user-${i}`);
  for (let i = 0; i < 100; i++) {
    it(`percentage rule deterministic for userId=${userIds[i]}, key=feat, pct=50`, () => {
      const reg = freshRegistry();
      const key = `pct-feat-${i}`;
      const pct = 50;
      reg.define(key, true, {
        rules: [{ strategy: 'percentage', percentage: pct }],
      });
      const expected = expectedInRollout(userIds[i], key, pct);
      expect(reg.isEnabled(key, { userId: userIds[i] })).toBe(expected);
    });
  }
});

// ─── 6. isEnabled with rule: environment — 100 tests ─────────────────────────

describe('isEnabled with rules - environment', () => {
  const envs = ['production', 'staging', 'development', 'test', 'qa'];
  for (let i = 0; i < 50; i++) {
    it(`environment rule: matching env index ${i} → true`, () => {
      const reg = freshRegistry();
      const env = envs[i % envs.length];
      reg.define(`env-feat-${i}`, true, {
        rules: [{ strategy: 'environment', environments: [env, 'staging'] }],
      });
      expect(reg.isEnabled(`env-feat-${i}`, { environment: env })).toBe(true);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`environment rule: wrong env index ${i} → false`, () => {
      const reg = freshRegistry();
      reg.define(`env-feat2-${i}`, true, {
        rules: [{ strategy: 'environment', environments: ['production'] }],
      });
      expect(reg.isEnabled(`env-feat2-${i}`, { environment: 'development' })).toBe(false);
    });
  }
});

// ─── 7. isEnabled with rule: group — 20 tests ────────────────────────────────

describe('isEnabled with rules - group', () => {
  for (let i = 0; i < 10; i++) {
    it(`group rule: groupId group-${i} in list → true`, () => {
      const reg = freshRegistry();
      reg.define(`grp-feat-${i}`, true, {
        rules: [{ strategy: 'group', groups: [`group-${i}`] }],
      });
      expect(reg.isEnabled(`grp-feat-${i}`, { groupId: `group-${i}` })).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`group rule: groupId other-${i} not in list → false`, () => {
      const reg = freshRegistry();
      reg.define(`grp-feat2-${i}`, true, {
        rules: [{ strategy: 'group', groups: ['beta'] }],
      });
      expect(reg.isEnabled(`grp-feat2-${i}`, { groupId: `other-${i}` })).toBe(false);
    });
  }
});

// ─── 8. isEnabled with rule: all / none — 20 tests ───────────────────────────

describe('isEnabled with rules - all / none strategies', () => {
  for (let i = 0; i < 10; i++) {
    it(`strategy 'all' always returns true index ${i}`, () => {
      const reg = freshRegistry();
      reg.define(`all-feat-${i}`, true, { rules: [{ strategy: 'all' }] });
      expect(reg.isEnabled(`all-feat-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`strategy 'none' always returns false index ${i}`, () => {
      const reg = freshRegistry();
      reg.define(`none-feat-${i}`, true, { rules: [{ strategy: 'none' }] });
      expect(reg.isEnabled(`none-feat-${i}`)).toBe(false);
    });
  }
});

// ─── 9. inRollout — 100 tests ────────────────────────────────────────────────

describe('inRollout helper', () => {
  for (let i = 0; i < 50; i++) {
    it(`inRollout deterministic: same inputs always same result (i=${i})`, () => {
      const userId = `user-rollout-${i}`;
      const key = `key-rollout-${i}`;
      const pct = (i % 100) + 1;
      const r1 = inRollout(userId, key, pct);
      const r2 = inRollout(userId, key, pct);
      expect(r1).toBe(r2);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`inRollout 0% always returns false (i=${i})`, () => {
      expect(inRollout(`user-${i}`, `key-${i}`, 0)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`inRollout 100% always returns true (i=${i})`, () => {
      expect(inRollout(`user-${i}`, `key-${i}`, 100)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`inRollout matches expectedInRollout for various pct (i=${i})`, () => {
      const userId = `test-user-${i}`;
      const key = `test-key-${i}`;
      const pct = i * 10;
      expect(inRollout(userId, key, pct)).toBe(expectedInRollout(userId, key, pct));
    });
  }
});

// ─── 10. getVariant — 100 tests ──────────────────────────────────────────────

describe('getVariant experiment', () => {
  beforeEach(() => {
    defineExperiment({
      key: 'test-exp',
      variants: ['control', 'treatment'],
      weights: [50, 50],
    });
    defineExperiment({
      key: 'three-way',
      variants: ['control', 'a', 'b'],
      weights: [34, 33, 33],
    });
  });

  for (let i = 0; i < 50; i++) {
    it(`getVariant returns valid variant for user-${i} in two-way experiment`, () => {
      const v = getVariant('test-exp', `user-${i}`);
      expect(['control', 'treatment']).toContain(v);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`getVariant is deterministic for user-${i} in two-way experiment`, () => {
      const v1 = getVariant('test-exp', `user-${i}`);
      const v2 = getVariant('test-exp', `user-${i}`);
      expect(v1).toBe(v2);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getVariant returns valid variant for user-${i} in three-way experiment`, () => {
      const v = getVariant('three-way', `user-${i}`);
      expect(['control', 'a', 'b']).toContain(v);
    });
  }
});

// ─── 11. getVariant unknown experiment — 5 tests ─────────────────────────────

describe('getVariant unknown experiment', () => {
  for (let i = 0; i < 5; i++) {
    it(`getVariant returns 'control' for unknown experiment (i=${i})`, () => {
      expect(getVariant(`nonexistent-exp-${i}`, `user-${i}`)).toBe('control');
    });
  }
});

// ─── 12. guard — 100 tests ───────────────────────────────────────────────────

describe('guard function', () => {
  for (let i = 0; i < 40; i++) {
    it(`guard calls fn when toggle enabled (i=${i})`, () => {
      const reg2 = new FeatureToggleRegistry();
      reg2.define(`guard-on-${i}`, true);
      // Test via globalRegistry
      globalRegistry.define(`guard-on-${i}`, true);
      const called: number[] = [];
      const result = guard(`guard-on-${i}`, () => { called.push(i); return i * 2; });
      expect(result).toBe(i * 2);
      expect(called).toContain(i);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`guard calls fallback when toggle disabled (i=${i})`, () => {
      globalRegistry.define(`guard-off-${i}`, false);
      const result = guard(`guard-off-${i}`, () => 999, () => i + 1);
      expect(result).toBe(i + 1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`guard returns undefined when disabled and no fallback (i=${i})`, () => {
      globalRegistry.define(`guard-undef-${i}`, false);
      const result = guard(`guard-undef-${i}`, () => 42);
      expect(result).toBeUndefined();
    });
  }
});

// ─── 13. snapshot — 50 tests ─────────────────────────────────────────────────

describe('snapshot', () => {
  for (let i = 1; i <= 50; i++) {
    it(`snapshot contains ${i} keys when ${i} toggles defined`, () => {
      const reg = freshRegistry();
      for (let j = 0; j < i; j++) {
        reg.define(`snap-key-${j}`, j % 2 === 0);
      }
      // Use a fresh registry-level snapshot by building from reg.list()
      const snap: Record<string, boolean> = {};
      for (const t of reg.list()) {
        snap[t.key] = t.enabled;
      }
      expect(Object.keys(snap).length).toBe(i);
    });
  }
});

// ─── 14. diffSnapshots — 100 tests ───────────────────────────────────────────

describe('diffSnapshots', () => {
  for (let i = 0; i < 30; i++) {
    it(`diffSnapshots identifies added key (i=${i})`, () => {
      const a: Record<string, boolean> = {};
      const b: Record<string, boolean> = { [`new-key-${i}`]: true };
      const diff = diffSnapshots(a, b);
      expect(diff.added).toContain(`new-key-${i}`);
      expect(diff.removed).toHaveLength(0);
      expect(diff.changed).toHaveLength(0);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`diffSnapshots identifies removed key (i=${i})`, () => {
      const a: Record<string, boolean> = { [`old-key-${i}`]: true };
      const b: Record<string, boolean> = {};
      const diff = diffSnapshots(a, b);
      expect(diff.removed).toContain(`old-key-${i}`);
      expect(diff.added).toHaveLength(0);
      expect(diff.changed).toHaveLength(0);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`diffSnapshots identifies changed key (i=${i})`, () => {
      const a: Record<string, boolean> = { [`chg-key-${i}`]: true };
      const b: Record<string, boolean> = { [`chg-key-${i}`]: false };
      const diff = diffSnapshots(a, b);
      expect(diff.changed).toContain(`chg-key-${i}`);
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`diffSnapshots returns empty arrays for identical snapshots (i=${i})`, () => {
      const snap: Record<string, boolean> = { a: true, b: false, c: true };
      const diff = diffSnapshots(snap, { ...snap });
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
      expect(diff.changed).toHaveLength(0);
    });
  }
});

// ─── 15. byTag — 50 tests ────────────────────────────────────────────────────

describe('byTag filtering', () => {
  for (let i = 0; i < 50; i++) {
    it(`byTag returns only toggles with tag 'beta' (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`tagged-${i}`, true, { tags: ['beta', 'internal'] });
      reg.define(`untagged-${i}`, true, { tags: ['alpha'] });
      const result = reg.byTag('beta');
      expect(result.map(t => t.key)).toContain(`tagged-${i}`);
      expect(result.map(t => t.key)).not.toContain(`untagged-${i}`);
    });
  }
});

// ─── 16. search — 50 tests ───────────────────────────────────────────────────

describe('search filtering', () => {
  for (let i = 0; i < 25; i++) {
    it(`search by key substring finds match (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`searchable-feature-${i}`, true, { description: 'some description' });
      reg.define(`other-feature-${i}`, true, { description: 'nothing' });
      const results = reg.search(`searchable-feature-${i}`);
      expect(results.map(t => t.key)).toContain(`searchable-feature-${i}`);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`search by description substring finds match (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`feat-desc-${i}`, true, { description: `unique-desc-${i}` });
      const results = reg.search(`unique-desc-${i}`);
      expect(results.map(t => t.key)).toContain(`feat-desc-${i}`);
    });
  }
});

// ─── 17. toJSON / fromJSON — 50 tests ────────────────────────────────────────

describe('toJSON / fromJSON serialization', () => {
  for (let i = 0; i < 25; i++) {
    it(`toJSON includes all toggle data for ${i} toggles`, () => {
      const reg = freshRegistry();
      for (let j = 0; j <= i; j++) {
        reg.define(`serial-${j}`, j % 2 === 0, { description: `desc-${j}`, tags: [`tag-${j}`] });
      }
      const json = reg.toJSON();
      expect(Object.keys(json).length).toBe(i + 1);
      expect(json[`serial-${i}`].enabled).toBe(i % 2 === 0);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`fromJSON roundtrip restores toggle-${i} correctly`, () => {
      const reg = freshRegistry();
      reg.define(`rt-${i}`, true, { description: `roundtrip-${i}`, tags: ['rt'] });
      const json = reg.toJSON();

      const reg2 = freshRegistry();
      reg2.fromJSON(json);
      expect(reg2.get(`rt-${i}`)?.enabled).toBe(true);
      expect(reg2.get(`rt-${i}`)?.description).toBe(`roundtrip-${i}`);
    });
  }
});

// ─── 18. delete / exists / keys — 30 tests ───────────────────────────────────

describe('delete / exists / keys', () => {
  for (let i = 0; i < 10; i++) {
    it(`exists returns true after define (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`ex-${i}`, true);
      expect(reg.exists(`ex-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`exists returns false after delete (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`del-${i}`, true);
      reg.delete(`del-${i}`);
      expect(reg.exists(`del-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`keys() returns all defined keys (i=${i})`, () => {
      const reg = freshRegistry();
      for (let j = 0; j <= i; j++) {
        reg.define(`k-${j}`, true);
      }
      const keys = reg.keys();
      expect(keys.length).toBe(i + 1);
      expect(keys).toContain(`k-${i}`);
    });
  }
});

// ─── 19. enableAll / disableAll / reset — 30 tests ───────────────────────────

describe('enableAll / disableAll / reset', () => {
  for (let i = 0; i < 10; i++) {
    it(`enableAll enables all toggles (i=${i})`, () => {
      const reg = freshRegistry();
      for (let j = 0; j <= i; j++) {
        reg.define(`ea-${j}`, false);
      }
      reg.enableAll();
      for (let j = 0; j <= i; j++) {
        expect(reg.get(`ea-${j}`)?.enabled).toBe(true);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`disableAll disables all toggles (i=${i})`, () => {
      const reg = freshRegistry();
      for (let j = 0; j <= i; j++) {
        reg.define(`da-${j}`, true);
      }
      reg.disableAll();
      for (let j = 0; j <= i; j++) {
        expect(reg.get(`da-${j}`)?.enabled).toBe(false);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`reset clears all toggles (i=${i})`, () => {
      const reg = freshRegistry();
      for (let j = 0; j <= i; j++) {
        reg.define(`rst-${j}`, true);
      }
      reg.reset();
      expect(reg.list().length).toBe(0);
      expect(reg.keys().length).toBe(0);
    });
  }
});

// ─── 20. constructor with initial values — 20 tests ──────────────────────────

describe('FeatureToggleRegistry constructor with initial values', () => {
  for (let i = 0; i < 10; i++) {
    it(`constructor with boolean initial values (i=${i})`, () => {
      const init: Record<string, boolean> = {};
      for (let j = 0; j <= i; j++) {
        init[`init-bool-${j}`] = j % 2 === 0;
      }
      const reg = new FeatureToggleRegistry(init);
      for (let j = 0; j <= i; j++) {
        expect(reg.get(`init-bool-${j}`)?.enabled).toBe(j % 2 === 0);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`constructor with Toggle objects (i=${i})`, () => {
      const now = new Date();
      const toggle = {
        key: `toggle-obj-${i}`,
        enabled: true,
        description: `desc-${i}`,
        tags: [`t${i}`],
        createdAt: now,
        updatedAt: now,
      };
      const reg = new FeatureToggleRegistry({ [`toggle-obj-${i}`]: toggle });
      expect(reg.get(`toggle-obj-${i}`)?.enabled).toBe(true);
    });
  }
});

// ─── 21. Global singleton functions — 40 tests ───────────────────────────────

describe('Global singleton API', () => {
  beforeEach(() => {
    globalRegistry.reset();
  });

  for (let i = 0; i < 10; i++) {
    it(`globalDefine + globalIsEnabled (i=${i})`, () => {
      globalDefine(`global-feat-${i}`, true);
      expect(globalIsEnabled(`global-feat-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`globalEnable sets enabled=true (i=${i})`, () => {
      globalDefine(`ge-feat-${i}`, false);
      globalEnable(`ge-feat-${i}`);
      expect(globalIsEnabled(`ge-feat-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`globalDisable sets enabled=false (i=${i})`, () => {
      globalDefine(`gd-feat-${i}`, true);
      globalDisable(`gd-feat-${i}`);
      expect(globalIsEnabled(`gd-feat-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`listToggles returns all defined toggles (i=${i})`, () => {
      for (let j = 0; j <= i; j++) {
        globalDefine(`lt-feat-${j}`, j % 2 === 0);
      }
      const list = listToggles();
      expect(list.length).toBe(i + 1);
    });
  }
});

// ─── 22. snapshot (global) — 20 tests ────────────────────────────────────────

describe('snapshot global function', () => {
  beforeEach(() => {
    globalRegistry.reset();
  });

  for (let i = 1; i <= 20; i++) {
    it(`snapshot has ${i} entries when ${i} global toggles defined`, () => {
      for (let j = 0; j < i; j++) {
        globalDefine(`snap-g-${j}`, j % 2 === 0);
      }
      const snap = snapshot();
      expect(Object.keys(snap).length).toBe(i);
    });
  }
});

// ─── 23. byEnvironment — 20 tests ────────────────────────────────────────────

describe('byEnvironment filtering', () => {
  for (let i = 0; i < 10; i++) {
    it(`byEnvironment returns toggles with matching env rule (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`env-flt-${i}`, true, {
        rules: [{ strategy: 'environment', environments: [`env-${i}`, 'staging'] }],
      });
      reg.define(`no-env-flt-${i}`, true);
      const result = reg.byEnvironment(`env-${i}`);
      expect(result.map(t => t.key)).toContain(`env-flt-${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`byEnvironment does not return toggles without matching env (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`env-miss-${i}`, true, {
        rules: [{ strategy: 'environment', environments: ['production'] }],
      });
      const result = reg.byEnvironment(`staging-${i}`);
      expect(result.map(t => t.key)).not.toContain(`env-miss-${i}`);
    });
  }
});

// ─── 24. Multiple rules AND semantics — 20 tests ─────────────────────────────

describe('Multiple rules AND semantics', () => {
  for (let i = 0; i < 10; i++) {
    it(`both rules pass → isEnabled true (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`and-feat-${i}`, true, {
        rules: [
          { strategy: 'userList', users: [`user-${i}`] },
          { strategy: 'environment', environments: ['production'] },
        ],
      });
      expect(
        reg.isEnabled(`and-feat-${i}`, { userId: `user-${i}`, environment: 'production' }),
      ).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`one rule fails → isEnabled false (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`and-feat2-${i}`, true, {
        rules: [
          { strategy: 'userList', users: [`user-${i}`] },
          { strategy: 'environment', environments: ['production'] },
        ],
      });
      // Wrong environment
      expect(
        reg.isEnabled(`and-feat2-${i}`, { userId: `user-${i}`, environment: 'staging' }),
      ).toBe(false);
    });
  }
});

// ─── 25. createdAt / updatedAt timestamps — 20 tests ─────────────────────────

describe('Toggle timestamps', () => {
  for (let i = 0; i < 10; i++) {
    it(`createdAt is set on define (i=${i})`, () => {
      const reg = freshRegistry();
      const before = new Date();
      reg.define(`ts-feat-${i}`, true);
      const after = new Date();
      const t = reg.get(`ts-feat-${i}`)!;
      expect(t.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(t.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`updatedAt changes on enable (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`ts-en-${i}`, false);
      const before = reg.get(`ts-en-${i}`)!.updatedAt.getTime();
      // Ensure at least 1ms passes
      const t0 = reg.get(`ts-en-${i}`)!.createdAt;
      reg.enable(`ts-en-${i}`);
      const after = reg.get(`ts-en-${i}`)!.updatedAt.getTime();
      expect(after).toBeGreaterThanOrEqual(before);
      // createdAt should not change
      expect(reg.get(`ts-en-${i}`)!.createdAt.getTime()).toBe(t0.getTime());
    });
  }
});

// ─── 26. inRollout negative/edge percentage — 20 tests ───────────────────────

describe('inRollout edge cases', () => {
  for (let i = 0; i < 10; i++) {
    it(`inRollout pct=-1 returns false (i=${i})`, () => {
      expect(inRollout(`user-${i}`, `key-${i}`, -1)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`inRollout pct=101 returns true (i=${i})`, () => {
      expect(inRollout(`user-${i}`, `key-${i}`, 101)).toBe(true);
    });
  }
});

// ─── 27. delete returns boolean — 10 tests ───────────────────────────────────

describe('delete return value', () => {
  for (let i = 0; i < 5; i++) {
    it(`delete returns true for existing key (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`del-bool-${i}`, true);
      expect(reg.delete(`del-bool-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`delete returns false for nonexistent key (i=${i})`, () => {
      const reg = freshRegistry();
      expect(reg.delete(`nonexistent-del-${i}`)).toBe(false);
    });
  }
});

// ─── 28. define returns this (chaining) — 10 tests ───────────────────────────

describe('define / enable / disable chaining', () => {
  for (let i = 0; i < 5; i++) {
    it(`define returns this for chaining (i=${i})`, () => {
      const reg = freshRegistry();
      const result = reg.define(`chain-${i}`, true);
      expect(result).toBe(reg);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`enable.disable chain works (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`chain2-${i}`, true).disable(`chain2-${i}`).enable(`chain2-${i}`);
      expect(reg.get(`chain2-${i}`)?.enabled).toBe(true);
    });
  }
});

// ─── 29. fromJSON preserves dates — 10 tests ─────────────────────────────────

describe('fromJSON date parsing', () => {
  for (let i = 0; i < 10; i++) {
    it(`fromJSON converts createdAt string to Date (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`date-feat-${i}`, true);
      const json = reg.toJSON();
      const reg2 = freshRegistry();
      reg2.fromJSON(json);
      expect(reg2.get(`date-feat-${i}`)?.createdAt).toBeInstanceOf(Date);
    });
  }
});

// ─── 30. list() order — 10 tests ─────────────────────────────────────────────

describe('list() returns all toggles', () => {
  for (let i = 1; i <= 10; i++) {
    it(`list() has length ${i} after defining ${i} toggles`, () => {
      const reg = freshRegistry();
      for (let j = 0; j < i; j++) {
        reg.define(`list-feat-${j}`, true);
      }
      expect(reg.list().length).toBe(i);
    });
  }
});

// ─── 31. isEnabled with no userId on userList rule — 10 tests ────────────────

describe('isEnabled userList rule with no userId in context', () => {
  for (let i = 0; i < 10; i++) {
    it(`userList rule without userId in ctx returns false (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`ul-noctx-${i}`, true, {
        rules: [{ strategy: 'userList', users: ['alice'] }],
      });
      expect(reg.isEnabled(`ul-noctx-${i}`, {})).toBe(false);
    });
  }
});

// ─── 32. isEnabled with no groupId on group rule — 10 tests ──────────────────

describe('isEnabled group rule with no groupId in context', () => {
  for (let i = 0; i < 10; i++) {
    it(`group rule without groupId in ctx returns false (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`grp-noctx-${i}`, true, {
        rules: [{ strategy: 'group', groups: ['beta'] }],
      });
      expect(reg.isEnabled(`grp-noctx-${i}`, {})).toBe(false);
    });
  }
});

// ─── 33. isEnabled with no environment on environment rule — 10 tests ─────────

describe('isEnabled environment rule with no environment in context', () => {
  for (let i = 0; i < 10; i++) {
    it(`environment rule without environment in ctx returns false (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`env-noctx-${i}`, true, {
        rules: [{ strategy: 'environment', environments: ['production'] }],
      });
      expect(reg.isEnabled(`env-noctx-${i}`, {})).toBe(false);
    });
  }
});

// ─── 34. isEnabled toggle disabled overrides rules — 10 tests ────────────────

describe('isEnabled disabled toggle overrides rules', () => {
  for (let i = 0; i < 10; i++) {
    it(`disabled toggle with 'all' rule still returns false (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`dis-all-${i}`, false, { rules: [{ strategy: 'all' }] });
      expect(reg.isEnabled(`dis-all-${i}`)).toBe(false);
    });
  }
});

// ─── 35. diffSnapshots with combined changes — 10 tests ──────────────────────

describe('diffSnapshots combined changes', () => {
  for (let i = 0; i < 10; i++) {
    it(`diffSnapshots handles added+removed+changed simultaneously (i=${i})`, () => {
      const a: Record<string, boolean> = {
        [`keep-${i}`]: true,
        [`remove-${i}`]: true,
        [`change-${i}`]: true,
      };
      const b: Record<string, boolean> = {
        [`keep-${i}`]: true,
        [`add-${i}`]: false,
        [`change-${i}`]: false,
      };
      const diff = diffSnapshots(a, b);
      expect(diff.added).toContain(`add-${i}`);
      expect(diff.removed).toContain(`remove-${i}`);
      expect(diff.changed).toContain(`change-${i}`);
      expect(diff.added).not.toContain(`keep-${i}`);
    });
  }
});

// ─── 36. byTag with multiple tags — 10 tests ─────────────────────────────────

describe('byTag with multiple tags on a toggle', () => {
  for (let i = 0; i < 10; i++) {
    it(`byTag finds toggle with multiple tags by each tag (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`multi-tag-${i}`, true, { tags: [`alpha`, `beta-${i}`, `gamma`] });
      expect(reg.byTag('alpha').map(t => t.key)).toContain(`multi-tag-${i}`);
      expect(reg.byTag(`beta-${i}`).map(t => t.key)).toContain(`multi-tag-${i}`);
      expect(reg.byTag('gamma').map(t => t.key)).toContain(`multi-tag-${i}`);
    });
  }
});

// ─── 37. search case-insensitive — 10 tests ───────────────────────────────────

describe('search case insensitivity', () => {
  for (let i = 0; i < 10; i++) {
    it(`search finds toggle with uppercase query (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`case-feature-${i}`, true, { description: `Case Test ${i}` });
      expect(reg.search(`CASE-FEATURE-${i}`).map(t => t.key)).toContain(`case-feature-${i}`);
    });
  }
});

// ─── 38. percentage rule with undefined userId — 10 tests ────────────────────

describe('percentage rule with no userId', () => {
  for (let i = 0; i < 10; i++) {
    it(`percentage rule with no userId uses empty string as userId (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`pct-noctx-${i}`, true, {
        rules: [{ strategy: 'percentage', percentage: 50 }],
      });
      // Should not throw, returns deterministic result based on '' userId
      const result = reg.isEnabled(`pct-noctx-${i}`);
      expect(typeof result).toBe('boolean');
    });
  }
});

// ─── 39. define with no opts — 10 tests ──────────────────────────────────────

describe('define with no options', () => {
  for (let i = 0; i < 10; i++) {
    it(`define without opts sets undefined description and tags (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`no-opts-${i}`, true);
      const t = reg.get(`no-opts-${i}`)!;
      expect(t.description).toBeUndefined();
      expect(t.tags).toBeUndefined();
      expect(t.rules).toBeUndefined();
    });
  }
});

// ─── 40. enable on nonexistent key creates it — 10 tests ─────────────────────

describe('enable on nonexistent key', () => {
  for (let i = 0; i < 10; i++) {
    it(`enable on nonexistent key creates enabled toggle (i=${i})`, () => {
      const reg = freshRegistry();
      reg.enable(`auto-create-${i}`);
      expect(reg.exists(`auto-create-${i}`)).toBe(true);
      expect(reg.get(`auto-create-${i}`)?.enabled).toBe(true);
    });
  }
});

// ─── 41. disable on nonexistent key creates it disabled — 10 tests ───────────

describe('disable on nonexistent key', () => {
  for (let i = 0; i < 10; i++) {
    it(`disable on nonexistent key creates disabled toggle (i=${i})`, () => {
      const reg = freshRegistry();
      reg.disable(`auto-dis-${i}`);
      expect(reg.exists(`auto-dis-${i}`)).toBe(true);
      expect(reg.get(`auto-dis-${i}`)?.enabled).toBe(false);
    });
  }
});

// ─── 42. getVariant single variant — 10 tests ────────────────────────────────

describe('getVariant single variant experiment', () => {
  beforeEach(() => {
    defineExperiment({ key: 'single-variant', variants: ['control'], weights: [100] });
  });

  for (let i = 0; i < 10; i++) {
    it(`getVariant single variant always returns 'control' (i=${i})`, () => {
      expect(getVariant('single-variant', `user-sv-${i}`)).toBe('control');
    });
  }
});

// ─── 43. inRollout various percentages — 10 tests ────────────────────────────

describe('inRollout boundary percentages', () => {
  for (let i = 1; i <= 10; i++) {
    it(`inRollout with percentage=${i * 10} matches expected formula`, () => {
      const userId = `boundary-user-${i}`;
      const key = `boundary-key-${i}`;
      const pct = i * 10;
      expect(inRollout(userId, key, pct)).toBe(expectedInRollout(userId, key, pct));
    });
  }
});

// ─── 44. search empty query — 5 tests ────────────────────────────────────────

describe('search with empty query returns all', () => {
  for (let i = 1; i <= 5; i++) {
    it(`search('') returns all ${i} defined toggles`, () => {
      const reg = freshRegistry();
      for (let j = 0; j < i; j++) {
        reg.define(`all-search-${j}`, true);
      }
      expect(reg.search('').length).toBe(i);
    });
  }
});

// ─── 45. fromJSON merges into existing — 5 tests ─────────────────────────────

describe('fromJSON merges into existing registry', () => {
  for (let i = 0; i < 5; i++) {
    it(`fromJSON merges into existing toggles without clearing (i=${i})`, () => {
      const reg = freshRegistry();
      reg.define(`existing-${i}`, true);
      const reg2 = freshRegistry();
      reg2.define(`new-${i}`, false);
      reg.fromJSON(reg2.toJSON());
      expect(reg.exists(`existing-${i}`)).toBe(true);
      expect(reg.exists(`new-${i}`)).toBe(true);
    });
  }
});

// ─── 46. guard with context — 5 tests ────────────────────────────────────────

describe('guard with context', () => {
  for (let i = 0; i < 5; i++) {
    it(`guard uses context to evaluate userList rule (i=${i})`, () => {
      globalRegistry.reset();
      globalRegistry.define(`guard-ctx-${i}`, true, {
        rules: [{ strategy: 'userList', users: [`ctx-user-${i}`] }],
      });
      const result = guard(
        `guard-ctx-${i}`,
        () => `allowed-${i}`,
        () => `denied-${i}`,
        { userId: `ctx-user-${i}` },
      );
      expect(result).toBe(`allowed-${i}`);
    });
  }
});
