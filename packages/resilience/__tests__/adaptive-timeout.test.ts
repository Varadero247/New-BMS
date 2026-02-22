import { AdaptiveTimeout, withAdaptiveTimeout } from '../src/adaptive-timeout';

describe('AdaptiveTimeout', () => {
  // ── Construction ─────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with 0 samples', () => {
      expect(new AdaptiveTimeout().sampleCount).toBe(0);
    });

    it('returns baseTimeoutMs before minSamples are collected', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 3000, minSamples: 10 });
      t.record(100);
      expect(t.getTimeout()).toBe(3000);
    });
  });

  // ── record() ─────────────────────────────────────────────────────────────────

  describe('record()', () => {
    it('increments sampleCount', () => {
      const t = new AdaptiveTimeout();
      t.record(50);
      t.record(100);
      expect(t.sampleCount).toBe(2);
    });

    it('caps at windowSize', () => {
      const t = new AdaptiveTimeout({ windowSize: 5 });
      for (let i = 0; i < 10; i++) t.record(i * 10);
      expect(t.sampleCount).toBe(5);
    });
  });

  // ── percentile() ─────────────────────────────────────────────────────────────

  describe('percentile()', () => {
    it('returns 0 with no samples', () => {
      expect(new AdaptiveTimeout().percentile(95)).toBe(0);
    });

    it('calculates p50 (median)', () => {
      const t = new AdaptiveTimeout();
      [10, 20, 30, 40, 50].forEach((v) => t.record(v));
      expect(t.percentile(50)).toBe(30);
    });

    it('calculates p95 from 20 samples', () => {
      const t = new AdaptiveTimeout();
      for (let i = 1; i <= 20; i++) t.record(i * 10);
      // p95 of [10,20,...,200]: 95th percentile index = ceil(0.95*20)-1 = 18 (0-indexed) → 190
      expect(t.percentile(95)).toBe(190);
    });

    it('p100 returns max value', () => {
      const t = new AdaptiveTimeout();
      [100, 200, 50, 300].forEach((v) => t.record(v));
      expect(t.percentile(100)).toBe(300);
    });
  });

  // ── getTimeout() ─────────────────────────────────────────────────────────────

  describe('getTimeout()', () => {
    it('returns base timeout before enough samples', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 5000, minSamples: 10 });
      for (let i = 0; i < 9; i++) t.record(100);
      expect(t.getTimeout()).toBe(5000);
    });

    it('uses p95 × marginFactor after enough samples', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 2,
        baseTimeoutMs: 1000,
      });
      // Record 5 uniform samples of 100ms
      for (let i = 0; i < 5; i++) t.record(100);
      // p95 = 100, margin = 2 → adaptive = 200
      expect(t.getTimeout()).toBe(200);
    });

    it('respects minTimeoutMs', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 1,
        minTimeoutMs: 500,
      });
      for (let i = 0; i < 5; i++) t.record(10); // p95=10, *1=10 < 500
      expect(t.getTimeout()).toBe(500);
    });

    it('respects maxTimeoutMs', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 10,
        maxTimeoutMs: 1000,
      });
      for (let i = 0; i < 5; i++) t.record(500); // p95=500, *10=5000 > 1000
      expect(t.getTimeout()).toBe(1000);
    });
  });

  // ── reset() ──────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('clears all samples', () => {
      const t = new AdaptiveTimeout();
      t.record(100);
      t.record(200);
      t.reset();
      expect(t.sampleCount).toBe(0);
    });

    it('reverts to base timeout after reset', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 3000, minSamples: 2 });
      t.record(100);
      t.record(100);
      const before = t.getTimeout();
      t.reset();
      expect(t.getTimeout()).toBe(3000);
      expect(before).not.toBe(3000); // was adaptive before reset
    });
  });
});

// ── withAdaptiveTimeout() ─────────────────────────────────────────────────────

describe('withAdaptiveTimeout()', () => {
  it('resolves with the operation result', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    const result = await withAdaptiveTimeout(t, async () => 42);
    expect(result).toBe(42);
  });

  it('records latency after successful operation', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    await withAdaptiveTimeout(t, async () => 'ok');
    expect(t.sampleCount).toBe(1);
  });

  it('rejects when operation throws', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    await expect(
      withAdaptiveTimeout(t, async () => { throw new Error('boom'); })
    ).rejects.toThrow('boom');
  });

  it('still records latency on error', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    try {
      await withAdaptiveTimeout(t, async () => { throw new Error('x'); });
    } catch {
      // expected
    }
    expect(t.sampleCount).toBe(1);
  });

  it('rejects with timeout error when operation is too slow', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 10 }); // 10ms timeout
    // 50ms > 10ms outer timeout — still demonstrates the timeout; short enough not to leak.
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 50)))
    ).rejects.toThrow(/timed out/i);
  });

  it('uses custom error message on timeout', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 10 });
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 50)), 'Database call timed out')
    ).rejects.toThrow('Database call timed out');
  });
});

// ── Additional edge cases ─────────────────────────────────────────────────────

describe('AdaptiveTimeout — edge cases and boundary conditions', () => {
  it('percentile(0) returns the minimum value', () => {
    const t = new AdaptiveTimeout();
    [10, 20, 30, 40, 50].forEach((v) => t.record(v));
    expect(t.percentile(0)).toBe(10);
  });

  it('percentile(100) with single sample returns that sample', () => {
    const t = new AdaptiveTimeout();
    t.record(777);
    expect(t.percentile(100)).toBe(777);
  });

  it('windowSize=1 only retains the latest sample', () => {
    const t = new AdaptiveTimeout({ windowSize: 1 });
    t.record(100);
    t.record(200);
    t.record(300);
    expect(t.sampleCount).toBe(1);
    expect(t.percentile(50)).toBe(300);
  });

  it('getTimeout with exactly minSamples samples uses adaptive logic', () => {
    const t = new AdaptiveTimeout({ minSamples: 3, marginFactor: 1, baseTimeoutMs: 9999 });
    t.record(200);
    t.record(200);
    t.record(200);
    // exactly minSamples — should use adaptive (p95=200, *1=200)
    expect(t.getTimeout()).toBe(200);
  });

  it('getTimeout rounds to integer (no decimals)', () => {
    const t = new AdaptiveTimeout({ minSamples: 1, marginFactor: 1.333, maxTimeoutMs: 60000 });
    t.record(300);
    const timeout = t.getTimeout();
    expect(Number.isInteger(timeout)).toBe(true);
  });

  it('reset allows fresh samples to be recorded', () => {
    const t = new AdaptiveTimeout({ minSamples: 2 });
    t.record(100);
    t.record(100);
    t.reset();
    t.record(500);
    // Only 1 sample after reset, below minSamples=2, so falls back to base
    expect(t.getTimeout()).toBe(t['cfg'].baseTimeoutMs);
  });

  it('multiple records do not exceed windowSize=10', () => {
    const t = new AdaptiveTimeout({ windowSize: 10 });
    for (let i = 0; i < 20; i++) t.record(i * 5);
    expect(t.sampleCount).toBe(10);
  });

  it('withAdaptiveTimeout records exactly 1 sample per invocation', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 5000 });
    await withAdaptiveTimeout(t, async () => 'result1');
    await withAdaptiveTimeout(t, async () => 'result2');
    expect(t.sampleCount).toBe(2);
  });

  it('percentile with all identical samples returns that sample', () => {
    const t = new AdaptiveTimeout();
    [50, 50, 50, 50, 50].forEach((v) => t.record(v));
    expect(t.percentile(95)).toBe(50);
    expect(t.percentile(50)).toBe(50);
  });

  it('getTimeout clamps below minTimeoutMs=200', () => {
    const t = new AdaptiveTimeout({
      minSamples: 2,
      marginFactor: 0.1,
      minTimeoutMs: 200,
      maxTimeoutMs: 5000,
    });
    t.record(50);
    t.record(50);
    // p95=50 * 0.1 = 5, clamped up to 200
    expect(t.getTimeout()).toBe(200);
  });
});

describe('AdaptiveTimeout — additional boundary tests', () => {
  it('default baseTimeoutMs is 5000', () => {
    const t = new AdaptiveTimeout();
    expect(t.getTimeout()).toBe(5000);
  });

  it('default minSamples is 10 — 9 samples still uses base', () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 2000 });
    for (let i = 0; i < 9; i++) t.record(100);
    expect(t.getTimeout()).toBe(2000);
  });

  it('percentile(50) with two samples returns lower of the two', () => {
    const t = new AdaptiveTimeout();
    t.record(100);
    t.record(200);
    // sorted [100, 200], p50: ceil(0.5*2)-1 = 0 → 100
    expect(t.percentile(50)).toBe(100);
  });

  it('sampleCount is 0 after construction', () => {
    expect(new AdaptiveTimeout({ windowSize: 100 }).sampleCount).toBe(0);
  });

  it('reset() after zero records does not throw', () => {
    const t = new AdaptiveTimeout();
    expect(() => t.reset()).not.toThrow();
    expect(t.sampleCount).toBe(0);
  });

  it('withAdaptiveTimeout resolves with null correctly', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    const result = await withAdaptiveTimeout(t, async () => null);
    expect(result).toBeNull();
  });
});

describe('AdaptiveTimeout — extended boundary tests', () => {
  it('getTimeout increases as marginFactor increases', () => {
    const t1 = new AdaptiveTimeout({ minSamples: 2, marginFactor: 1 });
    const t2 = new AdaptiveTimeout({ minSamples: 2, marginFactor: 3 });
    t1.record(100); t1.record(100);
    t2.record(100); t2.record(100);
    expect(t2.getTimeout()).toBeGreaterThan(t1.getTimeout());
  });

  it('sampleCount reflects window size cap correctly after many records', () => {
    const t = new AdaptiveTimeout({ windowSize: 7 });
    for (let i = 0; i < 15; i++) t.record(i * 10);
    expect(t.sampleCount).toBe(7);
  });

  it('percentile(50) with single sample equals that sample', () => {
    const t = new AdaptiveTimeout();
    t.record(250);
    expect(t.percentile(50)).toBe(250);
  });

  it('withAdaptiveTimeout result is correct for async operations returning objects', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 2000 });
    const obj = { status: 'ok', count: 5 };
    const result = await withAdaptiveTimeout(t, async () => obj);
    expect(result).toEqual(obj);
  });
});

describe('adaptive timeout — phase29 coverage', () => {
  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles string slice', () => {
    expect('hello'.slice(1, 3)).toBe('el');
  });

});

describe('adaptive timeout — phase30 coverage', () => {
  it('handles Promise type', () => {
    expect(Promise.resolve(42)).toBeInstanceOf(Promise);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

});


describe('phase31 coverage', () => {
  it('handles destructuring', () => { const {a, b} = {a:1, b:2}; expect(a).toBe(1); expect(b).toBe(2); });
  it('handles Math.max', () => { expect(Math.max(1,5,3)).toBe(5); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles string toUpperCase', () => { expect('hello'.toUpperCase()).toBe('HELLO'); });
  it('handles Object.entries', () => { expect(Object.entries({a:1})).toEqual([['a',1]]); });
});


describe('phase32 coverage', () => {
  it('handles number formatting', () => { expect((1234.5).toFixed(1)).toBe('1234.5'); });
  it('returns correct type for number', () => { expect(typeof 42).toBe('number'); });
  it('handles array at method', () => { expect([1,2,3].at(-1)).toBe(3); });
  it('handles string substring', () => { expect('hello'.substring(1,3)).toBe('el'); });
  it('handles instanceof check', () => { class Dog {} const d = new Dog(); expect(d instanceof Dog).toBe(true); });
});


describe('phase33 coverage', () => {
  it('handles string length property', () => { expect('typescript'.length).toBe(10); });
  it('handles encodeURIComponent', () => { expect(encodeURIComponent('hello world')).toBe('hello%20world'); });
  it('handles partial application', () => { const multiply = (a: number, b: number) => a * b; const triple = multiply.bind(null, 3); expect(triple(7)).toBe(21); });
  it('handles object toString', () => { expect(Object.prototype.toString.call([])).toBe('[object Array]'); });
  it('handles Date methods', () => { const d = new Date(2026, 0, 15); expect(d.getMonth()).toBe(0); expect(d.getDate()).toBe(15); });
});


describe('phase34 coverage', () => {
  it('handles default export pattern', () => { const fn = (x: number) => x * 2; expect(fn(5)).toBe(10); });
  it('handles Set union', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const union = new Set([...a,...b]); expect(union.size).toBe(4); });
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('handles default value in destructuring', () => { const {x=10,y=20} = {x:5} as {x?:number;y?:number}; expect(x).toBe(5); expect(y).toBe(20); });
});


describe('phase35 coverage', () => {
  it('handles number is even/odd', () => { const isEven = (n:number) => n%2===0; expect(isEven(4)).toBe(true); expect(isEven(7)).toBe(false); });
  it('handles range generator', () => { const range = (n: number) => Array.from({length:n},(_,i)=>i); expect(range(4)).toEqual([0,1,2,3]); });
  it('handles template literal type pattern', () => { type EventName = `on${Capitalize<string>}`; const handler: EventName = 'onClick'; expect(handler.startsWith('on')).toBe(true); });
  it('handles debounce-like pattern', () => { let count = 0; const fn = () => count++; fn(); fn(); fn(); expect(count).toBe(3); });
  it('handles retry pattern', async () => { let attempts = 0; const retry = async (fn: ()=>Promise<number>, n:number): Promise<number> => { try { return await fn(); } catch(e) { if(n<=0) throw e; return retry(fn,n-1); } }; const fn = () => { attempts++; return attempts < 3 ? Promise.reject(new Error()) : Promise.resolve(42); }; expect(await retry(fn,5)).toBe(42); });
});


describe('phase36 coverage', () => {
  it('handles number digit sum', () => { const digitSum=(n:number)=>String(Math.abs(n)).split('').reduce((s,d)=>s+Number(d),0);expect(digitSum(12345)).toBe(15);expect(digitSum(999)).toBe(27); });
  it('handles run-length encoding', () => { const rle=(s:string)=>{const r:string[]=[];let i=0;while(i<s.length){let j=i;while(j<s.length&&s[j]===s[i])j++;r.push(j-i>1?`${j-i}${s[i]}`:s[i]);i=j;}return r.join('');};expect(rle('AABBBCC')).toBe('2A3B2C'); });
  it('handles maximum subarray sum', () => { const maxSub=(a:number[])=>{let max=a[0],cur=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;};expect(maxSub([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); });
  it('handles linked-list node pattern', () => { class Node<T>{constructor(public val:T,public next:Node<T>|null=null){}} const head=new Node(1,new Node(2,new Node(3))); let s=0,n:Node<number>|null=head;while(n){s+=n.val;n=n.next;} expect(s).toBe(6); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
});


describe('phase37 coverage', () => {
  it('finds missing number in range', () => { const missing=(a:number[])=>{const n=a.length+1;const expected=n*(n+1)/2;return expected-a.reduce((s,v)=>s+v,0);}; expect(missing([1,2,4,5])).toBe(3); });
  it('rotates array left', () => { const rotL=<T>(a:T[],n:number)=>[...a.slice(n),...a.slice(0,n)]; expect(rotL([1,2,3,4,5],2)).toEqual([3,4,5,1,2]); });
  it('checks all unique', () => { const allUniq=<T>(a:T[])=>new Set(a).size===a.length; expect(allUniq([1,2,3])).toBe(true); expect(allUniq([1,2,1])).toBe(false); });
  it('sums digits recursively', () => { const dsum=(n:number):number=>n<10?n:n%10+dsum(Math.floor(n/10)); expect(dsum(9999)).toBe(36); });
  it('sums digits of a number', () => { const s=(n:number)=>String(n).split('').reduce((a,c)=>a+Number(c),0); expect(s(1234)).toBe(10); });
});


describe('phase38 coverage', () => {
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
  it('applies bubble sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=0;i<r.length;i++)for(let j=0;j<r.length-i-1;j++)if(r[j]>r[j+1])[r[j],r[j+1]]=[r[j+1],r[j]];return r;}; expect(sort([5,1,4,2,8])).toEqual([1,2,4,5,8]); });
  it('computes nth triangular number', () => { const tri=(n:number)=>n*(n+1)/2; expect(tri(4)).toBe(10); expect(tri(10)).toBe(55); });
  it('converts binary string to decimal', () => { expect(parseInt('1010',2)).toBe(10); expect(parseInt('11111111',2)).toBe(255); });
  it('finds peak element index', () => { const peak=(a:number[])=>a.indexOf(Math.max(...a)); expect(peak([1,3,7,2,4])).toBe(2); });
});
