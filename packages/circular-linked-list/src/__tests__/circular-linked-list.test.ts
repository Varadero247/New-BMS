// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { CircularLinkedList, createCircularLinkedList, fromArray } from '../circular-linked-list';

describe('CLL - constructor and initial state', () => {
  it('isEmpty on new list', () => { expect(new CircularLinkedList<number>().isEmpty).toBe(true); });
  it('size is 0 on new list', () => { expect(new CircularLinkedList<number>().size).toBe(0); });
  it('peekFirst returns undefined on empty', () => { expect(new CircularLinkedList<number>().peekFirst()).toBeUndefined(); });
  it('peekLast returns undefined on empty', () => { expect(new CircularLinkedList<number>().peekLast()).toBeUndefined(); });
  it('toArray returns [] on empty', () => { expect(new CircularLinkedList<number>().toArray()).toEqual([]); });
  it('removeFirst returns undefined on empty', () => { expect(new CircularLinkedList<number>().removeFirst()).toBeUndefined(); });
  it('removeLast returns undefined on empty', () => { expect(new CircularLinkedList<number>().removeLast()).toBeUndefined(); });
  it('contains returns false on empty', () => { expect(new CircularLinkedList<number>().contains(1)).toBe(false); });
  it('remove returns false on empty', () => { expect(new CircularLinkedList<number>().remove(1)).toBe(false); });
  it('at returns undefined on empty', () => { expect(new CircularLinkedList<number>().at(0)).toBeUndefined(); });
  it('clear on empty is safe', () => { const l = new CircularLinkedList<number>(); l.clear(); expect(l.isEmpty).toBe(true); });
  it('rotate on empty is safe', () => { const l = new CircularLinkedList<number>(); l.rotate(3); expect(l.isEmpty).toBe(true); });
  it('reverse on empty is safe', () => { const l = new CircularLinkedList<number>(); l.reverse(); expect(l.isEmpty).toBe(true); });
  it('iterator on empty yields nothing', () => { const l = new CircularLinkedList<number>(); expect([...l]).toEqual([]); });
  it('string list isEmpty', () => { expect(new CircularLinkedList<string>().isEmpty).toBe(true); });
});

describe('CLL - append (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`append single value ${i} → size 1`, () => {
      const l = new CircularLinkedList<number>(); l.append(i);
      expect(l.size).toBe(1);
    });
  }
});

describe('CLL - prepend (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`prepend ${i} to empty → size 1, peekFirst = ${i}`, () => {
      const l = new CircularLinkedList<number>(); l.prepend(i);
      expect(l.size).toBe(1);
      expect(l.peekFirst()).toBe(i);
    });
  }
});

describe('CLL - peekFirst after append (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`peekFirst after append ${i} = ${i}`, () => {
      const l = new CircularLinkedList<number>(); l.append(i);
      expect(l.peekFirst()).toBe(i);
    });
  }
});

describe('CLL - peekLast after append (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`peekLast of [0..${i-1}] = ${i-1}`, () => {
      const l = fromArray(Array.from({ length: i }, (_, j) => j));
      expect(l.peekLast()).toBe(i - 1);
    });
  }
});

describe('CLL - toArray length (100 tests)', () => {
  for (let n = 1; n <= 100; n++) {
    it(`toArray length for n=${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, j) => j));
      expect(l.toArray()).toHaveLength(n);
    });
  }
});

describe('CLL - toArray contents (100 tests)', () => {
  for (let n = 1; n <= 100; n++) {
    it(`toArray contents for n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, j) => j * 3);
      expect(fromArray(arr).toArray()).toEqual(arr);
    });
  }
});

describe('CLL - contains after append (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`contains ${i} after append`, () => {
      const l = new CircularLinkedList<number>(); l.append(i);
      expect(l.contains(i)).toBe(true);
    });
  }
});

describe('CLL - contains missing (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`contains ${1000 + i} returns false in [1,2,3]`, () => {
      expect(fromArray([1, 2, 3]).contains(1000 + i)).toBe(false);
    });
  }
});

describe('CLL - removeFirst (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`removeFirst returns ${i} and leaves empty`, () => {
      const l = new CircularLinkedList<number>(); l.append(i);
      expect(l.removeFirst()).toBe(i);
      expect(l.isEmpty).toBe(true);
    });
  }
});

describe('CLL - removeFirst on multi-element (50 tests)', () => {
  for (let n = 2; n <= 51; n++) {
    it(`removeFirst on size ${n} leaves size ${n - 1}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      l.removeFirst();
      expect(l.size).toBe(n - 1);
      expect(l.peekFirst()).toBe(1);
    });
  }
});

describe('CLL - removeLast (100 tests)', () => {
  for (let n = 1; n <= 100; n++) {
    it(`removeLast on size ${n} returns ${n - 1}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      expect(l.removeLast()).toBe(n - 1);
      expect(l.size).toBe(n - 1);
    });
  }
});

describe('CLL - at(0) (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`at(0) for n=${n} is 0`, () => {
      expect(fromArray(Array.from({ length: n }, (_, i) => i * 2)).at(0)).toBe(0);
    });
  }
});

describe('CLL - at(last index) (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`at(${n - 1}) for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(fromArray(arr).at(n - 1)).toBe(n - 1);
    });
  }
});

describe('CLL - at(mid) (50 tests)', () => {
  for (let n = 3; n <= 52; n++) {
    it(`at(1) for size ${n} is 1`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      expect(l.at(1)).toBe(1);
    });
  }
});

describe('CLL - at out of bounds (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`at(${100 + i}) out of bounds returns undefined`, () => {
      expect(fromArray([1, 2, 3]).at(100 + i)).toBeUndefined();
    });
  }
  it('at(-1) returns undefined', () => { expect(fromArray([1, 2, 3]).at(-1)).toBeUndefined(); });
  it('at(-100) returns undefined', () => { expect(fromArray([1, 2, 3]).at(-100)).toBeUndefined(); });
});

describe('CLL - remove existing (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`remove middle element ${i + 1} returns true`, () => {
      const l = fromArray([i, i + 1, i + 2]);
      expect(l.remove(i + 1)).toBe(true);
      expect(l.size).toBe(2);
    });
  }
});

describe('CLL - remove missing (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`remove missing ${1000 + i} returns false`, () => {
      expect(fromArray([1, 2, 3]).remove(1000 + i)).toBe(false);
    });
  }
});

describe('CLL - remove head (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`remove head element ${i} returns true`, () => {
      const l = fromArray([i, i + 1, i + 2]);
      expect(l.remove(i)).toBe(true);
      expect(l.peekFirst()).toBe(i + 1);
    });
  }
});

describe('CLL - remove tail (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`remove tail element ${i + 2} returns true`, () => {
      const l = fromArray([i, i + 1, i + 2]);
      expect(l.remove(i + 2)).toBe(true);
      expect(l.peekLast()).toBe(i + 1);
    });
  }
});

describe('CLL - rotate (100 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`rotate by size (no change) iteration ${i}`, () => {
      const arr = [10, 20, 30, 40, 50];
      const l = fromArray(arr);
      l.rotate(arr.length);
      expect(l.toArray()).toEqual(arr);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`rotate by 1 moves head iteration ${i}`, () => {
      const l = fromArray([1, 2, 3]);
      l.rotate(1);
      expect(l.peekFirst()).toBe(2);
    });
  }
});

describe('CLL - rotate specific values (50 tests)', () => {
  for (let r = 0; r < 50; r++) {
    it(`rotate [1,2,3,4,5] by ${r} → head is ${[1,2,3,4,5][r % 5]}`, () => {
      const arr = [1, 2, 3, 4, 5];
      const l = fromArray(arr);
      l.rotate(r);
      expect(l.peekFirst()).toBe(arr[r % 5]);
    });
  }
});

describe('CLL - rotate negative (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`rotate by -${i} on [1,2,3,4,5] gives head ${[1,2,3,4,5][((- i) % 5 + 5) % 5]}`, () => {
      const arr = [1, 2, 3, 4, 5];
      const l = fromArray(arr);
      l.rotate(-i);
      const expected = arr[(((-i) % 5) + 5) % 5];
      expect(l.peekFirst()).toBe(expected);
    });
  }
});

describe('CLL - reverse (100 tests)', () => {
  for (let n = 2; n <= 101; n++) {
    it(`reverse size ${n} → first is ${n - 1}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      l.reverse();
      expect(l.peekFirst()).toBe(n - 1);
    });
  }
});

describe('CLL - reverse toArray (50 tests)', () => {
  for (let n = 2; n <= 51; n++) {
    it(`reverse toArray size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const l = fromArray(arr);
      l.reverse();
      expect(l.toArray()).toEqual([...arr].reverse());
    });
  }
});

describe('CLL - clear (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`clear resets size iteration ${i}`, () => {
      const l = fromArray([1, 2, 3, 4, 5]);
      l.clear();
      expect(l.size).toBe(0);
      expect(l.isEmpty).toBe(true);
    });
  }
});

describe('CLL - clear then reuse (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`clear then append ${i}`, () => {
      const l = fromArray([1, 2, 3]);
      l.clear();
      l.append(i);
      expect(l.size).toBe(1);
      expect(l.peekFirst()).toBe(i);
    });
  }
});

describe('CLL - factory createCircularLinkedList (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`createCircularLinkedList is empty iteration ${i}`, () => {
      expect(createCircularLinkedList<number>().isEmpty).toBe(true);
    });
  }
});

describe('CLL - fromArray size (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`fromArray size n=${n}`, () => {
      expect(fromArray(Array.from({ length: n }, (_, i) => i)).size).toBe(n);
    });
  }
});

describe('CLL - fromArray empty (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`fromArray([]) is empty iteration ${i}`, () => {
      expect(fromArray<number>([]).isEmpty).toBe(true);
    });
  }
});

describe('CLL - iterator (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`spread operator on size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect([...fromArray(arr)]).toEqual(arr);
    });
  }
});

describe('CLL - iterator for..of (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`for..of accumulates sum for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const l = fromArray(arr);
      let sum = 0;
      for (const v of l) sum += v;
      const expected = arr.reduce((a, b) => a + b, 0);
      expect(sum).toBe(expected);
    });
  }
});

describe('CLL - prepend to non-empty (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`prepend ${i + 99} to [1,2,3] puts it at front`, () => {
      const l = fromArray([1, 2, 3]);
      l.prepend(i + 99);
      expect(l.peekFirst()).toBe(i + 99);
      expect(l.size).toBe(4);
    });
  }
});

describe('CLL - multiple appends maintain order (50 tests)', () => {
  for (let n = 2; n <= 51; n++) {
    it(`order preserved for n=${n} appends`, () => {
      const l = new CircularLinkedList<number>();
      for (let i = 0; i < n; i++) l.append(i * 7);
      expect(l.at(0)).toBe(0);
      expect(l.at(1)).toBe(7);
    });
  }
});

describe('CLL - size after operations (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`size after ${n} appends then 1 removeFirst`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      l.removeFirst();
      expect(l.size).toBe(n - 1);
    });
  }
});

describe('CLL - peekFirst unchanged after peekLast (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`peekLast does not move head for n=${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      l.peekLast();
      expect(l.peekFirst()).toBe(0);
    });
  }
});

describe('CLL - rotate then toArray (25 tests)', () => {
  for (let r = 1; r <= 25; r++) {
    it(`rotate [0..9] by ${r} → toArray correct`, () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const l = fromArray(arr);
      l.rotate(r);
      const expected = [...arr.slice(r % 10), ...arr.slice(0, r % 10)];
      expect(l.toArray()).toEqual(expected);
    });
  }
});

describe('CLL - single element operations (25 tests)', () => {
  for (let i = 1; i <= 25; i++) {
    it(`single element ${i}: peekFirst === peekLast`, () => {
      const l = fromArray([i]);
      expect(l.peekFirst()).toBe(l.peekLast());
    });
  }
});

describe('CLL - two element operations (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    it(`two element list [${i}, ${i + 1}] removeFirst → peekFirst is ${i + 1}`, () => {
      const l = fromArray([i, i + 1]);
      l.removeFirst();
      expect(l.peekFirst()).toBe(i + 1);
      expect(l.peekLast()).toBe(i + 1);
    });
  }
});

describe('CLL - string type (25 tests)', () => {
  const words = ['apple','banana','cherry','date','elderberry','fig','grape','honeydew','kiwi','lemon',
    'mango','nectarine','orange','papaya','quince','raspberry','strawberry','tangerine','ugli','vanilla',
    'watermelon','xigua','yuzu','zucchini','avocado'];
  for (let i = 0; i < 25; i++) {
    it(`string list contains '${words[i]}'`, () => {
      const l = fromArray(words.slice(0, i + 1));
      expect(l.contains(words[i])).toBe(true);
    });
  }
});

describe('CLL - boolean type (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`boolean list iteration ${i}`, () => {
      const l = new CircularLinkedList<boolean>();
      l.append(true); l.append(false); l.append(true);
      expect(l.toArray()).toEqual([true, false, true]);
    });
  }
});

describe('CLL - object type (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`object list peekFirst iteration ${i}`, () => {
      const obj = { id: i, name: `item${i}` };
      const l = new CircularLinkedList<typeof obj>();
      l.append(obj);
      expect(l.peekFirst()).toBe(obj);
    });
  }
});

describe('CLL - mixed prepend and append (25 tests)', () => {
  for (let i = 1; i <= 25; i++) {
    it(`mixed prepend/append size is ${i * 2}`, () => {
      const l = new CircularLinkedList<number>();
      for (let j = 0; j < i; j++) { l.append(j); l.prepend(j + 100); }
      expect(l.size).toBe(i * 2);
    });
  }
});

describe('CLL - sequential removeFirst depletes list (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`removeFirst ${n} times depletes list of size ${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      for (let i = 0; i < n; i++) l.removeFirst();
      expect(l.isEmpty).toBe(true);
      expect(l.size).toBe(0);
    });
  }
});

describe('CLL - sequential removeLast depletes list (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`removeLast ${n} times depletes list of size ${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      for (let i = 0; i < n; i++) l.removeLast();
      expect(l.isEmpty).toBe(true);
    });
  }
});

describe('CLL - at negative (10 tests)', () => {
  for (let i = 1; i <= 10; i++) {
    it(`at(-${i}) returns undefined`, () => {
      expect(fromArray([1, 2, 3]).at(-i)).toBeUndefined();
    });
  }
});

describe('CLL - contains after remove (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    it(`contains ${i + 1} false after remove iteration ${i}`, () => {
      const l = fromArray([i, i + 1, i + 2]);
      l.remove(i + 1);
      expect(l.contains(i + 1)).toBe(false);
    });
  }
});

describe('CLL - rotate by 0 (25 tests)', () => {
  for (let n = 2; n <= 26; n++) {
    it(`rotate by 0 no change for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const l = fromArray(arr);
      l.rotate(0);
      expect(l.toArray()).toEqual(arr);
    });
  }
});

describe('CLL - peekFirst after prepend chain (25 tests)', () => {
  for (let i = 1; i <= 25; i++) {
    it(`prepend ${i} times → peekFirst is ${i}`, () => {
      const l = new CircularLinkedList<number>();
      for (let j = 1; j <= i; j++) l.prepend(j);
      expect(l.peekFirst()).toBe(i);
    });
  }
});

describe('CLL - toArray after reverse then reverse (25 tests)', () => {
  for (let n = 2; n <= 26; n++) {
    it(`double reverse n=${n} restores original`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const l = fromArray(arr);
      l.reverse(); l.reverse();
      expect(l.toArray()).toEqual(arr);
    });
  }
});

describe('CLL - size consistency (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`size matches toArray().length for n=${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      expect(l.size).toBe(l.toArray().length);
    });
  }
});

describe('CLL - removeFirst returns ordered values (25 tests)', () => {
  for (let n = 2; n <= 26; n++) {
    it(`removeFirst twice on [0..${n-1}] → second is 1`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      l.removeFirst();
      expect(l.removeFirst()).toBe(1);
    });
  }
});

describe('CLL - large list operations (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`large list n=1000 size correct iteration ${i}`, () => {
      const l = fromArray(Array.from({ length: 1000 }, (_, j) => j));
      expect(l.size).toBe(1000);
      expect(l.peekFirst()).toBe(0);
      expect(l.peekLast()).toBe(999);
    });
  }
});

describe('CLL - edge: single element reverse (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`single element reverse is no-op iteration ${i}`, () => {
      const l = fromArray([42 + i]);
      l.reverse();
      expect(l.toArray()).toEqual([42 + i]);
    });
  }
});

describe('CLL - edge: single element rotate (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`single element rotate(${i}) is no-op`, () => {
      const l = fromArray([99]);
      l.rotate(i);
      expect(l.peekFirst()).toBe(99);
    });
  }
});

describe('CLL - createCircularLinkedList then populate (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`factory + append ${n} elements`, () => {
      const l = createCircularLinkedList<number>();
      for (let i = 0; i < n; i++) l.append(i);
      expect(l.size).toBe(n);
      expect(l.toArray()).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }
});

describe('CLL - remove first occurrence only (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`remove first occurrence of duplicate value ${i}`, () => {
      const l = fromArray([i, i, i]);
      l.remove(i);
      expect(l.size).toBe(2);
    });
  }
});

describe('CLL - at on all indices (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`at every index for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 5);
      const l = fromArray(arr);
      for (let i = 0; i < n; i++) {
        expect(l.at(i)).toBe(arr[i]);
      }
    });
  }
});

describe('CLL - alternating append/remove (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    it(`alternating append/removeFirst ${i} times leaves empty`, () => {
      const l = new CircularLinkedList<number>();
      for (let j = 0; j < i + 1; j++) { l.append(j); l.removeFirst(); }
      expect(l.isEmpty).toBe(true);
    });
  }
});

describe('CLL - contains all elements (25 tests)', () => {
  for (let n = 1; n <= 25; n++) {
    it(`contains all elements for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 11);
      const l = fromArray(arr);
      for (const v of arr) expect(l.contains(v)).toBe(true);
    });
  }
});

describe('CLL - iterator does not mutate (15 tests)', () => {
  for (let n = 1; n <= 15; n++) {
    it(`iteration does not change size for n=${n}`, () => {
      const l = fromArray(Array.from({ length: n }, (_, i) => i));
      const arr = [...l];
      expect(l.size).toBe(n);
      expect(arr).toHaveLength(n);
    });
  }
});

describe('CLL - multiple removeLast returns correct sequence (15 tests)', () => {
  for (let n = 2; n <= 16; n++) {
    it(`removeLast sequence for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const l = fromArray(arr);
      const removed: number[] = [];
      while (!l.isEmpty) removed.push(l.removeLast()!);
      expect(removed).toEqual([...arr].reverse());
    });
  }
});

describe('CLL - removeFirst returns correct sequence (15 tests)', () => {
  for (let n = 2; n <= 16; n++) {
    it(`removeFirst sequence for size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 3);
      const l = fromArray(arr);
      const removed: number[] = [];
      while (!l.isEmpty) removed.push(l.removeFirst()!);
      expect(removed).toEqual(arr);
    });
  }
});

describe('CLL - rotate then remove (15 tests)', () => {
  for (let r = 1; r <= 15; r++) {
    it(`rotate by ${r} then removeFirst`, () => {
      const arr = [0, 1, 2, 3, 4];
      const l = fromArray(arr);
      l.rotate(r);
      const head = l.removeFirst();
      expect(head).toBe(arr[r % 5]);
    });
  }
});

describe('CLL - prepend then peekLast unchanged (15 tests)', () => {
  for (let i = 1; i <= 15; i++) {
    it(`prepend ${i} to [10,20,30] → peekLast still 30`, () => {
      const l = fromArray([10, 20, 30]);
      l.prepend(i);
      expect(l.peekLast()).toBe(30);
    });
  }
});

describe('CLL - append then peekFirst unchanged (15 tests)', () => {
  for (let i = 1; i <= 15; i++) {
    it(`append ${i} to [10,20,30] → peekFirst still 10`, () => {
      const l = fromArray([10, 20, 30]);
      l.append(i);
      expect(l.peekFirst()).toBe(10);
    });
  }
});

describe('CLL - isEmpty after all removes (10 tests)', () => {
  for (let n = 1; n <= 10; n++) {
    it(`isEmpty true after removing all ${n} elements via remove`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1000);
      const l = fromArray(arr);
      for (const v of arr) l.remove(v);
      expect(l.isEmpty).toBe(true);
    });
  }
});

describe('CLL - null-safety: at on empty (5 tests)', () => {
  for (let i = 0; i < 5; i++) {
    it(`at(${i}) on empty list returns undefined`, () => {
      expect(new CircularLinkedList<number>().at(i)).toBeUndefined();
    });
  }
});

describe('CLL - fromArray with negative numbers (10 tests)', () => {
  for (let n = 1; n <= 10; n++) {
    it(`fromArray with negatives size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => -(i + 1));
      const l = fromArray(arr);
      expect(l.size).toBe(n);
      expect(l.peekFirst()).toBe(-1);
    });
  }
});

describe('CLL - rotate by size multiples (10 tests)', () => {
  for (let k = 1; k <= 10; k++) {
    it(`rotate by ${k} * size is identity`, () => {
      const arr = [1, 2, 3, 4, 5];
      const l = fromArray(arr);
      l.rotate(k * arr.length);
      expect(l.toArray()).toEqual(arr);
    });
  }
});
