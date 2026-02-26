// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  PersistentStack,
  PersistentQueue,
  PersistentList,
  PersistentMap,
  PersistentSet,
  PersistentVector,
  VersionedStore,
} from '../persistent-ds';

// ============================================================
// PersistentStack Tests
// ============================================================

describe('PersistentStack — empty()', () => {
  it('empty stack has size 0', () => {
    expect(PersistentStack.empty<number>().size).toBe(0);
  });
  it('empty stack isEmpty === true', () => {
    expect(PersistentStack.empty<number>().isEmpty).toBe(true);
  });
  it('empty stack peek returns undefined', () => {
    expect(PersistentStack.empty<number>().peek()).toBeUndefined();
  });
  it('empty stack toArray returns []', () => {
    expect(PersistentStack.empty<number>().toArray()).toEqual([]);
  });
  it('pop on empty stack returns same-size stack', () => {
    expect(PersistentStack.empty<number>().pop().size).toBe(0);
  });
  it('works with string type', () => {
    expect(PersistentStack.empty<string>().isEmpty).toBe(true);
  });
  it('works with boolean type', () => {
    expect(PersistentStack.empty<boolean>().size).toBe(0);
  });
  it('works with object type', () => {
    expect(PersistentStack.empty<{ x: number }>().peek()).toBeUndefined();
  });
});

describe('PersistentStack — push()', () => {
  // 30 push-size tests
  for (let n = 1; n <= 30; n++) {
    it(`push ${n} item(s) → size ${n}`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      expect(s.size).toBe(n);
    });
  }

  // 30 push-peek tests
  for (let n = 1; n <= 30; n++) {
    it(`push ${n} item(s) → peek returns last pushed (${n - 1})`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      expect(s.peek()).toBe(n - 1);
    });
  }

  // 20 isEmpty-after-push tests
  for (let n = 1; n <= 20; n++) {
    it(`after ${n} push(es) isEmpty is false`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i * 2);
      expect(s.isEmpty).toBe(false);
    });
  }
});

describe('PersistentStack — immutability', () => {
  // 20 tests verifying original stack is unchanged after push
  for (let n = 1; n <= 20; n++) {
    it(`push does not mutate original stack (n=${n})`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      const snap = s;
      const s2 = s.push(999);
      expect(snap.size).toBe(n);
      expect(snap.peek()).toBe(n - 1);
      expect(s2.size).toBe(n + 1);
      expect(s2.peek()).toBe(999);
    });
  }

  // 10 tests verifying pop does not mutate
  for (let n = 2; n <= 11; n++) {
    it(`pop does not mutate original stack (n=${n})`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      const popped = s.pop();
      expect(s.size).toBe(n);
      expect(popped.size).toBe(n - 1);
    });
  }
});

describe('PersistentStack — pop()', () => {
  for (let n = 1; n <= 20; n++) {
    it(`pop after ${n} pushes gives size ${n - 1}`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      expect(s.pop().size).toBe(n - 1);
    });
  }

  for (let n = 2; n <= 15; n++) {
    it(`pop from stack of ${n} gives correct new peek`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i * 3);
      const popped = s.pop();
      expect(popped.peek()).toBe((n - 2) * 3);
    });
  }
});

describe('PersistentStack — toArray()', () => {
  for (let n = 1; n <= 20; n++) {
    it(`toArray for stack of ${n} has correct length`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      expect(s.toArray().length).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`toArray for stack of ${n} returns elements top-first`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      const arr = s.toArray();
      expect(arr[0]).toBe(n - 1);
      expect(arr[arr.length - 1]).toBe(0);
    });
  }
});

describe('PersistentStack — full pop sequence', () => {
  for (let n = 1; n <= 15; n++) {
    it(`fully pop stack of ${n} reduces to empty`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      for (let i = 0; i < n; i++) s = s.pop();
      expect(s.isEmpty).toBe(true);
      expect(s.size).toBe(0);
    });
  }
});

// ============================================================
// PersistentQueue Tests
// ============================================================

describe('PersistentQueue — empty()', () => {
  it('empty queue size is 0', () => {
    expect(PersistentQueue.empty<number>().size).toBe(0);
  });
  it('empty queue isEmpty is true', () => {
    expect(PersistentQueue.empty<number>().isEmpty).toBe(true);
  });
  it('empty queue front() is undefined', () => {
    expect(PersistentQueue.empty<number>().front()).toBeUndefined();
  });
  it('empty queue toArray() is []', () => {
    expect(PersistentQueue.empty<number>().toArray()).toEqual([]);
  });
  it('dequeue on empty returns same-size queue', () => {
    expect(PersistentQueue.empty<number>().dequeue().size).toBe(0);
  });
  it('works with string type', () => {
    expect(PersistentQueue.empty<string>().isEmpty).toBe(true);
  });
});

describe('PersistentQueue — enqueue()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`enqueue ${n} item(s) → size ${n}`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.size).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`enqueue ${n} item(s) → front is first enqueued (0)`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.front()).toBe(0);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`after ${n} enqueues, isEmpty is false`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i * 5);
      expect(q.isEmpty).toBe(false);
    });
  }
});

describe('PersistentQueue — dequeue()', () => {
  for (let n = 1; n <= 20; n++) {
    it(`dequeue from queue of ${n} → size ${n - 1}`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.dequeue().size).toBe(n - 1);
    });
  }

  for (let n = 2; n <= 15; n++) {
    it(`dequeue from queue of ${n} → new front is 1`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.dequeue().front()).toBe(1);
    });
  }
});

describe('PersistentQueue — immutability', () => {
  for (let n = 1; n <= 15; n++) {
    it(`enqueue does not mutate original queue (n=${n})`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      const snap = q;
      const q2 = q.enqueue(999);
      expect(snap.size).toBe(n);
      expect(q2.size).toBe(n + 1);
      expect(snap.front()).toBe(0);
    });
  }

  for (let n = 2; n <= 12; n++) {
    it(`dequeue does not mutate original queue (n=${n})`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      const dq = q.dequeue();
      expect(q.size).toBe(n);
      expect(dq.size).toBe(n - 1);
    });
  }
});

describe('PersistentQueue — FIFO order', () => {
  for (let n = 2; n <= 20; n++) {
    it(`FIFO order maintained for ${n} elements`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      const result: number[] = [];
      while (!q.isEmpty) {
        result.push(q.front() as number);
        q = q.dequeue();
      }
      expect(result).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }
});

describe('PersistentQueue — toArray()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`toArray for queue of ${n} has length ${n}`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.toArray().length).toBe(n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`toArray for queue of ${n} starts with 0`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i);
      expect(q.toArray()[0]).toBe(0);
    });
  }
});

// ============================================================
// PersistentList Tests
// ============================================================

describe('PersistentList — empty()', () => {
  it('empty list has length 0', () => {
    expect(PersistentList.empty<number>().length).toBe(0);
  });
  it('empty list head is undefined', () => {
    expect(PersistentList.empty<number>().head()).toBeUndefined();
  });
  it('empty list toArray returns []', () => {
    expect(PersistentList.empty<number>().toArray()).toEqual([]);
  });
  it('empty list get(0) is undefined', () => {
    expect(PersistentList.empty<number>().get(0)).toBeUndefined();
  });
  it('reverse of empty list has length 0', () => {
    expect(PersistentList.empty<number>().reverse().length).toBe(0);
  });
  it('map on empty list gives empty list', () => {
    expect(PersistentList.empty<number>().map((x) => x * 2).length).toBe(0);
  });
  it('filter on empty list gives empty list', () => {
    expect(PersistentList.empty<number>().filter(() => true).length).toBe(0);
  });
  it('from([]) gives empty list', () => {
    expect(PersistentList.from<number>([]).length).toBe(0);
  });
});

describe('PersistentList — prepend()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`prepend ${n} times → length ${n}`, () => {
      let l = PersistentList.empty<number>();
      for (let i = 0; i < n; i++) l = l.prepend(i);
      expect(l.length).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`prepend ${n} items → head is last prepended (${n - 1})`, () => {
      let l = PersistentList.empty<number>();
      for (let i = 0; i < n; i++) l = l.prepend(i);
      expect(l.head()).toBe(n - 1);
    });
  }
});

describe('PersistentList — from()', () => {
  for (let n = 1; n <= 20; n++) {
    it(`from array of ${n} items → length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(PersistentList.from(arr).length).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`from array of ${n} items → toArray matches`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 2);
      expect(PersistentList.from(arr).toArray()).toEqual(arr);
    });
  }
});

describe('PersistentList — get()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`get(0) on list of ${n} returns first element`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 10);
      const l = PersistentList.from(arr);
      expect(l.get(0)).toBe(10);
    });
  }

  for (let n = 2; n <= 15; n++) {
    it(`get(${n - 1}) on list of ${n} returns last element`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 3);
      const l = PersistentList.from(arr);
      expect(l.get(n - 1)).toBe((n - 1) * 3);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`get(-1) on list of ${n} returns undefined`, () => {
      const l = PersistentList.from(Array.from({ length: n }, (_, i) => i));
      expect(l.get(-1)).toBeUndefined();
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`get(${n}) on list of ${n} (out of bounds) returns undefined`, () => {
      const l = PersistentList.from(Array.from({ length: n }, (_, i) => i));
      expect(l.get(n)).toBeUndefined();
    });
  }
});

describe('PersistentList — immutability', () => {
  for (let n = 1; n <= 15; n++) {
    it(`prepend does not mutate list of length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const l = PersistentList.from(arr);
      const l2 = l.prepend(999);
      expect(l.length).toBe(n);
      expect(l2.length).toBe(n + 1);
      expect(l.head()).toBe(0);
      expect(l2.head()).toBe(999);
    });
  }
});

describe('PersistentList — reverse()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`reverse of list of ${n} has same length`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(PersistentList.from(arr).reverse().length).toBe(n);
    });
  }

  for (let n = 2; n <= 12; n++) {
    it(`reverse of list of ${n} inverts order`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(PersistentList.from(arr).reverse().toArray()).toEqual([...arr].reverse());
    });
  }
});

describe('PersistentList — map()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`map doubles each element, list size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const l = PersistentList.from(arr).map((x) => x * 2);
      expect(l.toArray()).toEqual(arr.map((x) => x * 2));
    });
  }
});

describe('PersistentList — filter()', () => {
  for (let n = 2; n <= 15; n++) {
    it(`filter evens from list of ${n} has correct length`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const evens = arr.filter((x) => x % 2 === 0);
      expect(PersistentList.from(arr).filter((x) => x % 2 === 0).length).toBe(evens.length);
    });
  }
});

describe('PersistentList — tail()', () => {
  for (let n = 2; n <= 15; n++) {
    it(`tail of list of ${n} has length ${n - 1}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(PersistentList.from(arr).tail().length).toBe(n - 1);
    });
  }

  it('tail of empty list is empty', () => {
    expect(PersistentList.empty<number>().tail().length).toBe(0);
  });
});

// ============================================================
// PersistentMap Tests
// ============================================================

describe('PersistentMap — empty()', () => {
  it('empty map has size 0', () => {
    expect(PersistentMap.empty<string, number>().size).toBe(0);
  });
  it('empty map get returns undefined', () => {
    expect(PersistentMap.empty<string, number>().get('x')).toBeUndefined();
  });
  it('empty map has returns false', () => {
    expect(PersistentMap.empty<string, number>().has('x')).toBe(false);
  });
  it('empty map keys returns []', () => {
    expect(PersistentMap.empty<string, number>().keys()).toEqual([]);
  });
  it('empty map values returns []', () => {
    expect(PersistentMap.empty<string, number>().values()).toEqual([]);
  });
  it('empty map entries returns []', () => {
    expect(PersistentMap.empty<string, number>().entries()).toEqual([]);
  });
  it('delete on empty map returns size 0', () => {
    expect(PersistentMap.empty<string, number>().delete('x').size).toBe(0);
  });
});

describe('PersistentMap — set()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`set ${n} distinct key(s) → size ${n}`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      expect(m.size).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`set and get key k${n - 1} → ${n - 1}`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i * 10);
      expect(m.get(`k${n - 1}`)).toBe((n - 1) * 10);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`overwrite key gives new value (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`key`, i);
      expect(m.get('key')).toBe(n - 1);
      expect(m.size).toBe(1);
    });
  }
});

describe('PersistentMap — has()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`has returns true for all ${n} inserted keys`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`key${i}`, i);
      for (let i = 0; i < n; i++) {
        expect(m.has(`key${i}`)).toBe(true);
      }
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`has returns false for absent key (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`key${i}`, i);
      expect(m.has('absent')).toBe(false);
    });
  }
});

describe('PersistentMap — delete()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`delete reduces size (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      m = m.delete('k0');
      expect(m.size).toBe(n - 1);
      expect(m.has('k0')).toBe(false);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`delete absent key does not change size (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      expect(m.delete('absent').size).toBe(n);
    });
  }
});

describe('PersistentMap — immutability', () => {
  for (let n = 1; n <= 15; n++) {
    it(`set does not mutate original map (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      const snap = m;
      const m2 = m.set('newKey', 999);
      expect(snap.size).toBe(n);
      expect(snap.has('newKey')).toBe(false);
      expect(m2.size).toBe(n + 1);
    });
  }

  for (let n = 2; n <= 10; n++) {
    it(`delete does not mutate original map (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      const snap = m;
      const m2 = m.delete('k0');
      expect(snap.size).toBe(n);
      expect(snap.has('k0')).toBe(true);
      expect(m2.size).toBe(n - 1);
    });
  }
});

describe('PersistentMap — entries/keys/values()', () => {
  for (let n = 1; n <= 10; n++) {
    it(`entries() length equals size (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      expect(m.entries().length).toBe(n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`keys() length equals size (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`key${i}`, i);
      expect(m.keys().length).toBe(n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`values() length equals size (n=${n})`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`val${i}`, i * 7);
      expect(m.values().length).toBe(n);
    });
  }
});

// ============================================================
// PersistentSet Tests
// ============================================================

describe('PersistentSet — empty()', () => {
  it('empty set has size 0', () => {
    expect(PersistentSet.empty<string>().size).toBe(0);
  });
  it('empty set has returns false', () => {
    expect(PersistentSet.empty<string>().has('x')).toBe(false);
  });
  it('empty set toArray is []', () => {
    expect(PersistentSet.empty<string>().toArray()).toEqual([]);
  });
  it('delete on empty set returns size 0', () => {
    expect(PersistentSet.empty<string>().delete('x').size).toBe(0);
  });
  it('union of two empty sets is empty', () => {
    expect(
      PersistentSet.empty<string>().union(PersistentSet.empty<string>()).size,
    ).toBe(0);
  });
  it('intersection of two empty sets is empty', () => {
    expect(
      PersistentSet.empty<string>().intersection(PersistentSet.empty<string>()).size,
    ).toBe(0);
  });
  it('difference of two empty sets is empty', () => {
    expect(
      PersistentSet.empty<string>().difference(PersistentSet.empty<string>()).size,
    ).toBe(0);
  });
});

describe('PersistentSet — add()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`add ${n} distinct element(s) → size ${n}`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.size).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`add same element ${n} times → size stays 1`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add('same');
      expect(s.size).toBe(1);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`has returns true after add (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`x${i}`);
      expect(s.has(`x${n - 1}`)).toBe(true);
    });
  }
});

describe('PersistentSet — delete()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`delete reduces size (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      s = s.delete('e0');
      expect(s.size).toBe(n - 1);
      expect(s.has('e0')).toBe(false);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`delete absent element leaves size unchanged (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.delete('absent').size).toBe(n);
    });
  }
});

describe('PersistentSet — immutability', () => {
  for (let n = 1; n <= 12; n++) {
    it(`add does not mutate original set (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      const snap = s;
      const s2 = s.add('new');
      expect(snap.size).toBe(n);
      expect(snap.has('new')).toBe(false);
      expect(s2.size).toBe(n + 1);
    });
  }
});

describe('PersistentSet — union()', () => {
  for (let n = 1; n <= 10; n++) {
    it(`union of two disjoint sets of size ${n} has size ${n * 2}`, () => {
      let s1 = PersistentSet.empty<string>();
      let s2 = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s1 = s1.add(`a${i}`);
      for (let i = 0; i < n; i++) s2 = s2.add(`b${i}`);
      expect(s1.union(s2).size).toBe(n * 2);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`union of identical sets of size ${n} has size ${n}`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.union(s).size).toBe(n);
    });
  }
});

describe('PersistentSet — intersection()', () => {
  for (let n = 1; n <= 10; n++) {
    it(`intersection of identical sets of size ${n} has size ${n}`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.intersection(s).size).toBe(n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`intersection of disjoint sets of size ${n} is empty`, () => {
      let s1 = PersistentSet.empty<string>();
      let s2 = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s1 = s1.add(`a${i}`);
      for (let i = 0; i < n; i++) s2 = s2.add(`b${i}`);
      expect(s1.intersection(s2).size).toBe(0);
    });
  }
});

describe('PersistentSet — difference()', () => {
  for (let n = 1; n <= 10; n++) {
    it(`difference of set with itself is empty (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.difference(s).size).toBe(0);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`difference of set with empty is same size (n=${n})`, () => {
      let s = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s = s.add(`e${i}`);
      expect(s.difference(PersistentSet.empty<string>()).size).toBe(n);
    });
  }
});

// ============================================================
// PersistentVector Tests
// ============================================================

describe('PersistentVector — empty()', () => {
  it('empty vector has length 0', () => {
    expect(PersistentVector.empty<number>().length).toBe(0);
  });
  it('empty vector get(0) is undefined', () => {
    expect(PersistentVector.empty<number>().get(0)).toBeUndefined();
  });
  it('empty vector toArray returns []', () => {
    expect(PersistentVector.empty<number>().toArray()).toEqual([]);
  });
  it('pop on empty vector has length 0', () => {
    expect(PersistentVector.empty<number>().pop().length).toBe(0);
  });
  it('set on empty vector returns same length', () => {
    expect(PersistentVector.empty<number>().set(0, 99).length).toBe(0);
  });
  it('from([]) is empty', () => {
    expect(PersistentVector.from<number>([]).length).toBe(0);
  });
});

describe('PersistentVector — push()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`push ${n} item(s) → length ${n}`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      expect(v.length).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`push ${n} items → get(0) is 0`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i * 2);
      expect(v.get(0)).toBe(0);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`push ${n} items → get(${n - 1}) is last pushed`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i * 3);
      expect(v.get(n - 1)).toBe((n - 1) * 3);
    });
  }
});

describe('PersistentVector — from()', () => {
  for (let n = 1; n <= 20; n++) {
    it(`from array of ${n} → length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(PersistentVector.from(arr).length).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`from array of ${n} → toArray matches`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 4);
      expect(PersistentVector.from(arr).toArray()).toEqual(arr);
    });
  }
});

describe('PersistentVector — set()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`set(0, 99) on vector of ${n} replaces first element`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      const v2 = v.set(0, 99);
      expect(v2.get(0)).toBe(99);
      expect(v2.length).toBe(n);
    });
  }

  for (let n = 2; n <= 15; n++) {
    it(`set(${n - 1}, 77) on vector of ${n} replaces last element`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      const v2 = v.set(n - 1, 77);
      expect(v2.get(n - 1)).toBe(77);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`set out-of-bounds does not change length (n=${n})`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      expect(v.set(n, 99).length).toBe(n);
      expect(v.set(-1, 99).length).toBe(n);
    });
  }
});

describe('PersistentVector — immutability', () => {
  for (let n = 1; n <= 12; n++) {
    it(`push does not mutate original vector (n=${n})`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      const snap = v;
      const v2 = v.push(999);
      expect(snap.length).toBe(n);
      expect(v2.length).toBe(n + 1);
    });
  }

  for (let n = 2; n <= 10; n++) {
    it(`set does not mutate original vector (n=${n})`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      const snap = v;
      const v2 = v.set(0, 999);
      expect(snap.get(0)).toBe(0);
      expect(v2.get(0)).toBe(999);
    });
  }
});

describe('PersistentVector — pop()', () => {
  for (let n = 1; n <= 15; n++) {
    it(`pop vector of ${n} → length ${n - 1}`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      expect(v.pop().length).toBe(n - 1);
    });
  }

  for (let n = 2; n <= 12; n++) {
    it(`pop vector of ${n} → get(${n - 2}) still correct`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i * 5);
      expect(v.pop().get(n - 2)).toBe((n - 2) * 5);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`pop does not mutate original (n=${n})`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      const snap = v;
      v.pop();
      expect(snap.length).toBe(n);
    });
  }
});

describe('PersistentVector — get() out-of-bounds', () => {
  for (let n = 1; n <= 10; n++) {
    it(`get(-1) on vector of ${n} is undefined`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      expect(v.get(-1)).toBeUndefined();
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`get(${n}) on vector of ${n} (OOB) is undefined`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      expect(v.get(n)).toBeUndefined();
    });
  }
});

describe('PersistentVector — full pop sequence', () => {
  for (let n = 1; n <= 12; n++) {
    it(`fully pop vector of ${n} gives empty`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      for (let i = 0; i < n; i++) v = v.pop();
      expect(v.length).toBe(0);
    });
  }
});

// ============================================================
// VersionedStore Tests
// ============================================================

describe('VersionedStore — create()', () => {
  it('initial historyLength is 1', () => {
    expect(VersionedStore.create(0).historyLength).toBe(1);
  });
  it('initial current is the passed value', () => {
    expect(VersionedStore.create(42).current).toBe(42);
  });
  it('getVersion(0) returns initial value', () => {
    expect(VersionedStore.create(99).getVersion(0)).toBe(99);
  });
  it('getVersion(-1) returns undefined', () => {
    expect(VersionedStore.create(0).getVersion(-1)).toBeUndefined();
  });
  it('getVersion(1) on fresh store returns undefined', () => {
    expect(VersionedStore.create(0).getVersion(1)).toBeUndefined();
  });
  it('works with string values', () => {
    expect(VersionedStore.create('hello').current).toBe('hello');
  });
  it('works with object values', () => {
    const obj = { a: 1 };
    expect(VersionedStore.create(obj).current).toEqual({ a: 1 });
  });
  it('works with array values', () => {
    expect(VersionedStore.create([1, 2, 3]).current).toEqual([1, 2, 3]);
  });
});

describe('VersionedStore — update()', () => {
  for (let n = 1; n <= 25; n++) {
    it(`after ${n} update(s), historyLength is ${n + 1}`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      expect(store.historyLength).toBe(n + 1);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`after ${n} increment update(s), current is ${n}`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      expect(store.current).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`getVersion(0) always returns initial value after ${n} updates`, () => {
      let store = VersionedStore.create(100);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      expect(store.getVersion(0)).toBe(100);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`getVersion(${n}) returns ${n + 100} after ${n} +1 updates starting at 100`, () => {
      let store = VersionedStore.create(100);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      expect(store.getVersion(n)).toBe(100 + n);
    });
  }
});

describe('VersionedStore — immutability across updates', () => {
  for (let n = 1; n <= 12; n++) {
    it(`update does not mutate previous store (n=${n})`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      const snap = store;
      const updated = store.update((x) => x * 100);
      expect(snap.current).toBe(n);
      expect(updated.current).toBe(n * 100);
      expect(snap.historyLength).toBe(n + 1);
    });
  }
});

describe('VersionedStore — getVersion() edge cases', () => {
  for (let n = 1; n <= 10; n++) {
    it(`getVersion(${n + 5}) on store with ${n + 1} versions returns undefined`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      expect(store.getVersion(n + 5)).toBeUndefined();
    });
  }

  for (let n = 0; n <= 10; n++) {
    it(`getVersion(${n}) returns correct value for ${n} updates`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 2);
      expect(store.getVersion(n)).toBe(n * 2);
    });
  }
});

describe('VersionedStore — string store', () => {
  for (let n = 1; n <= 10; n++) {
    it(`appending ${n} character(s) to string store`, () => {
      let store = VersionedStore.create('');
      for (let i = 0; i < n; i++) store = store.update((s) => s + 'x');
      expect(store.current).toBe('x'.repeat(n));
    });
  }
});

describe('VersionedStore — object store', () => {
  for (let n = 1; n <= 10; n++) {
    it(`incrementing field ${n} time(s)`, () => {
      let store = VersionedStore.create({ count: 0, name: 'test' });
      for (let i = 0; i < n; i++) {
        store = store.update((obj) => ({ ...obj, count: obj.count + 1 }));
      }
      expect(store.current.count).toBe(n);
      expect(store.current.name).toBe('test');
    });
  }
});

// ============================================================
// Cross-structure immutability / sharing tests
// ============================================================

describe('Cross-structure — stack branching', () => {
  for (let n = 1; n <= 15; n++) {
    it(`two branches from same stack of ${n} are independent`, () => {
      let base = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) base = base.push(i);
      const branchA = base.push(100);
      const branchB = base.push(200);
      expect(branchA.peek()).toBe(100);
      expect(branchB.peek()).toBe(200);
      expect(base.size).toBe(n);
      expect(branchA.size).toBe(n + 1);
      expect(branchB.size).toBe(n + 1);
    });
  }
});

describe('Cross-structure — queue branching', () => {
  for (let n = 1; n <= 10; n++) {
    it(`two branches from same queue of ${n} are independent`, () => {
      let base = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) base = base.enqueue(i);
      const branchA = base.enqueue(100);
      const branchB = base.dequeue();
      expect(branchA.size).toBe(n + 1);
      expect(branchB.size).toBe(n - 1 > 0 ? n - 1 : 0);
      expect(base.size).toBe(n);
    });
  }
});

describe('Cross-structure — map branching', () => {
  for (let n = 1; n <= 10; n++) {
    it(`two branches from same map of ${n} are independent`, () => {
      let base = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) base = base.set(`k${i}`, i);
      const branchA = base.set('extra', 999);
      const branchB = base.delete('k0');
      expect(branchA.size).toBe(n + 1);
      expect(branchB.size).toBe(n - 1);
      expect(base.size).toBe(n);
    });
  }
});

describe('Cross-structure — set branching', () => {
  for (let n = 1; n <= 10; n++) {
    it(`two branches from same set of ${n} are independent`, () => {
      let base = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) base = base.add(`e${i}`);
      const branchA = base.add('extra');
      const branchB = base.delete('e0');
      expect(branchA.size).toBe(n + 1);
      expect(branchB.size).toBe(n - 1);
      expect(base.size).toBe(n);
    });
  }
});

describe('Cross-structure — vector branching', () => {
  for (let n = 1; n <= 10; n++) {
    it(`two branches from same vector of ${n} are independent`, () => {
      let base = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) base = base.push(i);
      const branchA = base.push(999);
      const branchB = base.set(0, 777);
      expect(branchA.length).toBe(n + 1);
      expect(branchB.get(0)).toBe(777);
      expect(base.get(0)).toBe(0);
    });
  }
});

// ============================================================
// Edge / corner case tests
// ============================================================

describe('PersistentStack — single element lifecycle', () => {
  it('push then pop gives empty', () => {
    const s = PersistentStack.empty<number>().push(42).pop();
    expect(s.isEmpty).toBe(true);
  });
  it('push then pop then push works', () => {
    const s = PersistentStack.empty<number>().push(1).pop().push(2);
    expect(s.peek()).toBe(2);
  });
  it('peek on single element', () => {
    expect(PersistentStack.empty<number>().push(7).peek()).toBe(7);
  });
});

describe('PersistentQueue — single element lifecycle', () => {
  it('enqueue then dequeue gives empty', () => {
    const q = PersistentQueue.empty<number>().enqueue(5).dequeue();
    expect(q.isEmpty).toBe(true);
  });
  it('front after enqueue is the enqueued value', () => {
    expect(PersistentQueue.empty<string>().enqueue('hello').front()).toBe('hello');
  });
  it('enqueue then dequeue then enqueue works', () => {
    const q = PersistentQueue.empty<number>().enqueue(1).dequeue().enqueue(2);
    expect(q.front()).toBe(2);
    expect(q.size).toBe(1);
  });
});

describe('PersistentList — single element', () => {
  it('from([42]) head is 42', () => {
    expect(PersistentList.from([42]).head()).toBe(42);
  });
  it('from([42]) tail is empty', () => {
    expect(PersistentList.from([42]).tail().length).toBe(0);
  });
  it('reverse of single-element list has same head', () => {
    expect(PersistentList.from([99]).reverse().head()).toBe(99);
  });
  it('map of single-element list applies fn', () => {
    expect(PersistentList.from([5]).map((x) => x * 10).toArray()).toEqual([50]);
  });
  it('filter keeps element if predicate true', () => {
    expect(PersistentList.from([4]).filter((x) => x > 0).length).toBe(1);
  });
  it('filter removes element if predicate false', () => {
    expect(PersistentList.from([4]).filter((x) => x < 0).length).toBe(0);
  });
});

describe('PersistentMap — collision handling', () => {
  it('keys sharing common prefix coexist', () => {
    let m = PersistentMap.empty<string, number>();
    m = m.set('abc', 1);
    m = m.set('abcd', 2);
    m = m.set('abcde', 3);
    expect(m.size).toBe(3);
    expect(m.get('abc')).toBe(1);
    expect(m.get('abcd')).toBe(2);
    expect(m.get('abcde')).toBe(3);
  });

  it('overwriting key preserves all other keys', () => {
    let m = PersistentMap.empty<string, number>();
    for (let i = 0; i < 10; i++) m = m.set(`k${i}`, i);
    m = m.set('k5', 999);
    expect(m.get('k5')).toBe(999);
    expect(m.size).toBe(10);
    for (let i = 0; i < 10; i++) {
      if (i !== 5) expect(m.get(`k${i}`)).toBe(i);
    }
  });

  it('delete then re-add restores key', () => {
    let m = PersistentMap.empty<string, number>().set('key', 1).delete('key').set('key', 2);
    expect(m.get('key')).toBe(2);
    expect(m.size).toBe(1);
  });
});

describe('PersistentSet — complex set algebra', () => {
  it('(A union B) intersection A equals A', () => {
    let a = PersistentSet.empty<string>();
    let b = PersistentSet.empty<string>();
    for (let i = 0; i < 5; i++) a = a.add(`a${i}`);
    for (let i = 0; i < 5; i++) b = b.add(`b${i}`);
    const unionAB = a.union(b);
    expect(unionAB.intersection(a).size).toBe(a.size);
  });

  it('(A difference B) union B contains all elements of A', () => {
    let a = PersistentSet.empty<string>();
    let b = PersistentSet.empty<string>();
    for (let i = 0; i < 5; i++) a = a.add(`a${i}`);
    for (let i = 3; i < 8; i++) b = b.add(`a${i}`);
    const diff = a.difference(b);
    const union = diff.union(b);
    // All original elements of A (a0..a4) should be in union (since b contains a3..a7)
    for (let i = 0; i < 5; i++) {
      expect(union.has(`a${i}`)).toBe(true);
    }
  });

  it('add → delete → has is false', () => {
    const s = PersistentSet.empty<string>().add('x').delete('x');
    expect(s.has('x')).toBe(false);
  });

  it('toArray contains all added elements', () => {
    let s = PersistentSet.empty<string>();
    const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
    for (const item of items) s = s.add(item);
    const arr = s.toArray().sort();
    expect(arr).toEqual(items.sort());
  });
});

describe('PersistentVector — toArray round-trip', () => {
  for (let n = 1; n <= 15; n++) {
    it(`from(arr).toArray() matches arr (n=${n})`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 7);
      expect(PersistentVector.from(arr).toArray()).toEqual(arr);
    });
  }
});

describe('VersionedStore — complex value updates', () => {
  it('can store and retrieve all intermediate values', () => {
    let store = VersionedStore.create(0);
    for (let i = 1; i <= 10; i++) store = store.update((x) => x + i);
    // Sum of 1+2+...+10 = 55
    expect(store.current).toBe(55);
    expect(store.getVersion(0)).toBe(0);
    expect(store.getVersion(1)).toBe(1);
    expect(store.getVersion(2)).toBe(3);
    expect(store.getVersion(3)).toBe(6);
  });

  it('multiple stores are independent', () => {
    const storeA = VersionedStore.create(0).update((x) => x + 10);
    const storeB = VersionedStore.create(0).update((x) => x + 20);
    expect(storeA.current).toBe(10);
    expect(storeB.current).toBe(20);
  });

  it('update with identity function increments history but not value', () => {
    let store = VersionedStore.create(5);
    store = store.update((x) => x);
    expect(store.current).toBe(5);
    expect(store.historyLength).toBe(2);
  });
});

// ============================================================
// Additional stress / combination tests to reach ≥1,100 total
// ============================================================

describe('PersistentStack — stress: build then drain', () => {
  for (let n = 5; n <= 20; n++) {
    it(`build ${n} then drain: LIFO order`, () => {
      let s = PersistentStack.empty<number>();
      for (let i = 0; i < n; i++) s = s.push(i);
      const drained: number[] = [];
      while (!s.isEmpty) {
        drained.push(s.peek() as number);
        s = s.pop();
      }
      expect(drained).toEqual(Array.from({ length: n }, (_, i) => n - 1 - i));
    });
  }
});

describe('PersistentMap — sequential set-delete cycle', () => {
  for (let n = 1; n <= 10; n++) {
    it(`set then delete ${n} key(s) yields empty map`, () => {
      let m = PersistentMap.empty<string, number>();
      for (let i = 0; i < n; i++) m = m.set(`k${i}`, i);
      for (let i = 0; i < n; i++) m = m.delete(`k${i}`);
      expect(m.size).toBe(0);
    });
  }
});

describe('PersistentList — chain map → filter', () => {
  for (let n = 2; n <= 12; n++) {
    it(`map then filter on list of ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const l = PersistentList.from(arr)
        .map((x) => x * 2)
        .filter((x) => x % 4 === 0);
      const expected = arr.map((x) => x * 2).filter((x) => x % 4 === 0);
      expect(l.toArray()).toEqual(expected);
    });
  }
});

describe('PersistentVector — alternating push and set', () => {
  for (let n = 2; n <= 12; n++) {
    it(`push then overwrite first element for n=${n}`, () => {
      let v = PersistentVector.empty<number>();
      for (let i = 0; i < n; i++) v = v.push(i);
      v = v.set(0, 999);
      expect(v.get(0)).toBe(999);
      for (let i = 1; i < n; i++) expect(v.get(i)).toBe(i);
    });
  }
});

describe('VersionedStore — rewind using getVersion', () => {
  for (let n = 3; n <= 12; n++) {
    it(`can retrieve all versions for store with ${n} updates`, () => {
      let store = VersionedStore.create(0);
      for (let i = 0; i < n; i++) store = store.update((x) => x + 1);
      for (let v = 0; v <= n; v++) {
        expect(store.getVersion(v)).toBe(v);
      }
    });
  }
});

describe('PersistentSet — toArray after union contains all elements', () => {
  for (let n = 1; n <= 10; n++) {
    it(`union of two sets of ${n} contains all ${n * 2} distinct elements`, () => {
      let s1 = PersistentSet.empty<string>();
      let s2 = PersistentSet.empty<string>();
      for (let i = 0; i < n; i++) s1 = s1.add(`a${i}`);
      for (let i = 0; i < n; i++) s2 = s2.add(`b${i}`);
      const union = s1.union(s2);
      for (let i = 0; i < n; i++) {
        expect(union.has(`a${i}`)).toBe(true);
        expect(union.has(`b${i}`)).toBe(true);
      }
    });
  }
});

describe('PersistentQueue — enqueue many then drain', () => {
  for (let n = 3; n <= 15; n++) {
    it(`enqueue ${n} then drain confirms FIFO`, () => {
      let q = PersistentQueue.empty<number>();
      for (let i = 0; i < n; i++) q = q.enqueue(i * 10);
      const drained: number[] = [];
      while (!q.isEmpty) {
        drained.push(q.front() as number);
        q = q.dequeue();
      }
      expect(drained).toEqual(Array.from({ length: n }, (_, i) => i * 10));
    });
  }
});
