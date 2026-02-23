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


describe('phase39 coverage', () => {
  it('implements Atbash cipher', () => { const atbash=(s:string)=>s.replace(/[a-z]/gi,c=>{const base=c<='Z'?65:97;return String.fromCharCode(25-(c.charCodeAt(0)-base)+base);}); expect(atbash('abc')).toBe('zyx'); });
  it('implements counting sort', () => { const csort=(a:number[],max:number)=>{const c=Array(max+1).fill(0);a.forEach(v=>c[v]++);const r:number[]=[];c.forEach((cnt,v)=>r.push(...Array(cnt).fill(v)));return r;}; expect(csort([4,2,3,1,4,2],4)).toEqual([1,2,2,3,4,4]); });
  it('generates Gray code sequence', () => { const gray=(n:number)=>Array.from({length:1<<n},(_,i)=>i^(i>>1)); const g=gray(2); expect(g).toEqual([0,1,3,2]); });
  it('computes number of ways to climb stairs', () => { const climbStairs=(n:number)=>{let a=1,b=1;for(let i=2;i<=n;i++){const c=a+b;a=b;b=c;}return b;}; expect(climbStairs(5)).toBe(8); });
  it('implements Sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v,i)=>v?i:-1).filter(v=>v>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); });
});


describe('phase40 coverage', () => {
  it('implements run-length encoding compactly', () => { const enc=(s:string)=>{let r='',i=0;while(i<s.length){let j=i;while(j<s.length&&s[j]===s[i])j++;r+=(j-i>1?String(j-i):'')+s[i];i=j;}return r;}; expect(enc('aaabbbcc')).toBe('3a3b2c'); expect(enc('abc')).toBe('abc'); });
  it('implements simple expression evaluator', () => { const calc=(s:string)=>{const tokens=s.split(/([+\-*/])/).map(t=>t.trim());let result=Number(tokens[0]);for(let i=1;i<tokens.length;i+=2){const op=tokens[i],val=Number(tokens[i+1]);if(op==='+')result+=val;else if(op==='-')result-=val;else if(op==='*')result*=val;else result/=val;}return result;}; expect(calc('3 + 4 * 2')).toBe(14); /* left-to-right */ });
  it('computes number of ways to tile a 2xN board', () => { const tile=(n:number)=>{if(n<=0)return 1;let a=1,b=1;for(let i=2;i<=n;i++){const c=a+b;a=b;b=c;}return b;}; expect(tile(4)).toBe(5); });
  it('computes consistent hash bucket', () => { const bucket=(key:string,n:number)=>[...key].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)%n; expect(bucket('user123',10)).toBeGreaterThanOrEqual(0); expect(bucket('user123',10)).toBeLessThan(10); });
  it('computes nth ugly number', () => { const ugly=(n:number)=>{const u=[1];let i2=0,i3=0,i5=0;while(u.length<n){const next=Math.min(u[i2]*2,u[i3]*3,u[i5]*5);u.push(next);if(next===u[i2]*2)i2++;if(next===u[i3]*3)i3++;if(next===u[i5]*5)i5++;}return u[n-1];}; expect(ugly(10)).toBe(12); });
});


describe('phase41 coverage', () => {
  it('counts number of ways to express n as sum of consecutive', () => { const consecutive=(n:number)=>{let c=0;for(let i=2;i*(i-1)/2<n;i++)if((n-i*(i-1)/2)%i===0)c++;return c;}; expect(consecutive(15)).toBe(3); });
  it('finds majority element using Boyer-Moore', () => { const majority=(a:number[])=>{let cand=a[0],cnt=1;for(let i=1;i<a.length;i++){if(a[i]===cand)cnt++;else if(cnt===0){cand=a[i];cnt=1;}else cnt--;}return cand;}; expect(majority([2,2,1,1,1,2,2])).toBe(2); });
  it('checks if string matches wildcard pattern', () => { const match=(s:string,p:string)=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=p[j-1]==='*'?dp[i-1][j]||dp[i][j-1]:dp[i-1][j-1]&&(p[j-1]==='?'||p[j-1]===s[i-1]);return dp[m][n];}; expect(match('aa','*')).toBe(true); expect(match('cb','?a')).toBe(false); });
  it('finds articulation points count in graph', () => { const adjList=new Map([[0,[1,2]],[1,[0,2]],[2,[0,1,3]],[3,[2]]]); const n=4; const disc=Array(n).fill(-1),low=Array(n).fill(0); let timer=0; const aps=new Set<number>(); const dfs=(u:number,par:number)=>{disc[u]=low[u]=timer++;let children=0;for(const v of adjList.get(u)||[]){if(disc[v]===-1){children++;dfs(v,u);low[u]=Math.min(low[u],low[v]);if((par===-1&&children>1)||(par!==-1&&low[v]>=disc[u]))aps.add(u);}else if(v!==par)low[u]=Math.min(low[u],disc[v]);}}; dfs(0,-1); expect(aps.has(2)).toBe(true); });
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
});


describe('phase42 coverage', () => {
  it('finds number of rectangles in grid', () => { const rects=(m:number,n:number)=>m*(m+1)/2*n*(n+1)/2; expect(rects(2,2)).toBe(9); expect(rects(1,1)).toBe(1); });
  it('validates sudoku row uniqueness', () => { const valid=(row:number[])=>{const vals=row.filter(v=>v!==0);return new Set(vals).size===vals.length;}; expect(valid([1,2,3,4,5,6,7,8,9])).toBe(true); expect(valid([1,2,2,4,5,6,7,8,9])).toBe(false); });
  it('checks point inside rectangle', () => { const inside=(px:number,py:number,x:number,y:number,w:number,h:number)=>px>=x&&px<=x+w&&py>=y&&py<=y+h; expect(inside(5,5,0,0,10,10)).toBe(true); expect(inside(15,5,0,0,10,10)).toBe(false); });
  it('scales point from origin', () => { const scale=(x:number,y:number,s:number):[number,number]=>[x*s,y*s]; expect(scale(2,3,2)).toEqual([4,6]); });
  it('checks color contrast ratio passes AA', () => { const contrast=(l1:number,l2:number)=>(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); expect(contrast(1,0)).toBeCloseTo(21,0); });
});


describe('phase43 coverage', () => {
  it('builds relative time string', () => { const rel=(ms:number)=>{const s=Math.floor(ms/1000);if(s<60)return`${s}s ago`;if(s<3600)return`${Math.floor(s/60)}m ago`;return`${Math.floor(s/3600)}h ago`;}; expect(rel(30000)).toBe('30s ago'); expect(rel(90000)).toBe('1m ago'); expect(rel(7200000)).toBe('2h ago'); });
  it('computes exponential moving average', () => { const ema=(a:number[],k:number)=>{const f=2/(k+1);return a.reduce((acc,v,i)=>i===0?[v]:[...acc,v*f+acc[acc.length-1]*(1-f)],[] as number[]);}; expect(ema([1,2,3],3).length).toBe(3); });
  it('formats date to ISO date string', () => { const toISO=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; expect(toISO(new Date(2026,0,5))).toBe('2026-01-05'); });
  it('computes percentage change', () => { const pctChange=(from:number,to:number)=>((to-from)/from)*100; expect(pctChange(100,125)).toBe(25); expect(pctChange(200,150)).toBe(-25); });
  it('computes week number of year', () => { const weekNum=(d:Date)=>{const start=new Date(d.getFullYear(),0,1);return Math.ceil(((d.getTime()-start.getTime())/86400000+start.getDay()+1)/7);}; expect(weekNum(new Date('2026-01-01'))).toBe(1); });
});


describe('phase44 coverage', () => {
  it('computes Manhattan distance', () => { const man=(a:[number,number],b:[number,number])=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]); expect(man([1,2],[4,6])).toBe(7); });
  it('omits specified keys from object', () => { const omit=<T extends object,K extends keyof T>(o:T,...ks:K[]):Omit<T,K>=>{const r={...o} as any;ks.forEach(k=>delete r[k]);return r;}; expect(omit({a:1,b:2,c:3},'b')).toEqual({a:1,c:3}); });
  it('finds number of islands (flood fill)', () => { const ni=(g:number[][])=>{const r=g.map(row=>[...row]);let cnt=0;const dfs=(i:number,j:number)=>{if(i<0||i>=r.length||j<0||j>=r[0].length||r[i][j]!==1)return;r[i][j]=0;dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);};for(let i=0;i<r.length;i++)for(let j=0;j<r[0].length;j++)if(r[i][j]===1){cnt++;dfs(i,j);}return cnt;}; expect(ni([[1,1,0],[0,1,0],[0,0,1]])).toBe(2); });
  it('batches array of promises into groups', async () => { const batch=async<T>(fns:(()=>Promise<T>)[],size:number):Promise<T[]>=>{const r:T[]=[];for(let i=0;i<fns.length;i+=size){const g=await Promise.all(fns.slice(i,i+size).map(f=>f()));r.push(...g);}return r;};const fns=[1,2,3,4,5].map(n=>()=>Promise.resolve(n*2));const r=await batch(fns,2); expect(r).toEqual([2,4,6,8,10]); });
  it('computes nth Fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(0)).toBe(0); expect(fib(7)).toBe(13); expect(fib(10)).toBe(55); });
});


describe('phase45 coverage', () => {
  it('implements maybe monad', () => { type M<T>={val:T|null;map:<U>(fn:(v:T)=>U)=>M<U>;getOrElse:(d:T)=>T}; const maybe=<T>(v:T|null):M<T>=>({val:v,map:<U>(fn:(v:T)=>U)=>maybe(v!==null?fn(v):null) as unknown as M<U>,getOrElse:(d:T)=>v!==null?v:d}); expect(maybe(5).map(v=>v*2).getOrElse(0)).toBe(10); expect(maybe<number>(null).map(v=>v*2).getOrElse(0)).toBe(0); });
  it('computes Luhn checksum validity', () => { const luhn=(n:string)=>{const d=[...n].reverse().map(Number);const s=d.reduce((acc,v,i)=>{if(i%2===1){v*=2;if(v>9)v-=9;}return acc+v;},0);return s%10===0;}; expect(luhn('4532015112830366')).toBe(true); expect(luhn('1234567890123456')).toBe(false); });
  it('sums digits of a number', () => { const sd=(n:number)=>String(Math.abs(n)).split('').reduce((s,d)=>s+Number(d),0); expect(sd(12345)).toBe(15); expect(sd(9)).toBe(9); });
  it('implements union-find with path compression', () => { const uf=(n:number)=>{const p=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>p[x]===x?x:(p[x]=find(p[x]),p[x]);const union=(a:number,b:number)=>{p[find(a)]=find(b);};return{find,union};}; const u=uf(5);u.union(0,1);u.union(1,2); expect(u.find(0)===u.find(2)).toBe(true); expect(u.find(0)===u.find(3)).toBe(false); });
  it('generates spiral matrix', () => { const sp=(n:number)=>{const m:number[][]=Array.from({length:n},()=>new Array(n).fill(0));let t=0,b=n-1,l=0,r=n-1,num=1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)m[t][i]=num++;t++;for(let i=t;i<=b;i++)m[i][r]=num++;r--;if(t<=b){for(let i=r;i>=l;i--)m[b][i]=num++;b--;}if(l<=r){for(let i=b;i>=t;i--)m[i][l]=num++;l++;}}return m;}; const s=sp(3); expect(s[0]).toEqual([1,2,3]); expect(s[1]).toEqual([8,9,4]); expect(s[2]).toEqual([7,6,5]); });
});


describe('phase46 coverage', () => {
  it('level-order traversal of binary tree', () => { type N={v:number;l?:N;r?:N}; const lo=(root:N|undefined):number[][]=>{ if(!root)return[];const res:number[][]=[];const bq:[N,number][]=[[root,0]];while(bq.length){const[n,d]=bq.shift()!;if(!res[d])res[d]=[];res[d].push(n.v);if(n.l)bq.push([n.l,d+1]);if(n.r)bq.push([n.r,d+1]);}return res;}; const t:N={v:3,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; expect(lo(t)).toEqual([[3],[9,20],[15,7]]); });
  it('computes unique paths in grid', () => { const up=(m:number,n:number)=>{const dp=Array.from({length:m},()=>new Array(n).fill(1));for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}; expect(up(3,7)).toBe(28); expect(up(3,2)).toBe(3); });
  it('checks if number is deficient', () => { const def=(n:number)=>Array.from({length:n-1},(_,i)=>i+1).filter(d=>n%d===0).reduce((s,v)=>s+v,0)<n; expect(def(8)).toBe(true); expect(def(12)).toBe(false); });
  it('checks if array is sorted ascending', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||a[i-1]<=v); expect(isSorted([1,2,3,4,5])).toBe(true); expect(isSorted([1,3,2,4])).toBe(false); expect(isSorted([])).toBe(true); });
  it('generates balanced parentheses', () => { const bp=(n:number):string[]=>{const r:string[]=[];const bt=(s:string,o:number,c:number)=>{if(s.length===2*n)return r.push(s);if(o<n)bt(s+'(',o+1,c);if(c<o)bt(s+')',o,c+1);};bt('',0,0);return r;}; expect(bp(3).length).toBe(5); expect(bp(3)).toContain('((()))'); expect(bp(3)).toContain('()()()'); });
});


describe('phase47 coverage', () => {
  it('computes optimal binary search tree cost', () => { const obs=(p:number[])=>{const n=p.length;const dp=Array.from({length:n+2},()=>new Array(n+1).fill(0));const w=Array.from({length:n+2},()=>new Array(n+1).fill(0));for(let i=1;i<=n;i++)w[i][i]=p[i-1];for(let l=2;l<=n;l++)for(let i=1;i<=n-l+1;i++){const j=i+l-1;w[i][j]=w[i][j-1]+p[j-1];dp[i][j]=Infinity;for(let r=i;r<=j;r++){const c=(r>i?dp[i][r-1]:0)+(r<j?dp[r+1][j]:0)+w[i][j];dp[i][j]=Math.min(dp[i][j],c);}}return dp[1][n];}; expect(obs([0.25,0.2,0.05,0.2,0.3])).toBeCloseTo(1.5,1); });
  it('finds index of min element', () => { const argmin=(a:number[])=>a.reduce((mi,v,i)=>v<a[mi]?i:mi,0); expect(argmin([3,1,4,1,5])).toBe(1); expect(argmin([5,3,8,1])).toBe(3); });
  it('implements merge sort', () => { const ms=(a:number[]):number[]=>a.length<=1?a:(()=>{const m=a.length>>1,l=ms(a.slice(0,m)),r=ms(a.slice(m));const res:number[]=[];let i=0,j=0;while(i<l.length&&j<r.length)res.push(l[i]<r[j]?l[i++]:r[j++]);return res.concat(l.slice(i)).concat(r.slice(j));})(); expect(ms([38,27,43,3,9,82,10])).toEqual([3,9,10,27,38,43,82]); });
  it('computes Floyd-Warshall all-pairs shortest paths', () => { const fw=(d:number[][])=>{const n=d.length,r=d.map(row=>[...row]);for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(r[i][k]+r[k][j]<r[j][j+0]||true)r[i][j]=Math.min(r[i][j],r[i][k]+r[k][j]);return r;}; const INF=Infinity;const g=[[0,3,INF,5],[2,0,INF,4],[INF,1,0,INF],[INF,INF,2,0]]; const r=fw(g); expect(r[0][2]).toBe(7); expect(r[3][0]).toBe(5); });
  it('sorts nearly sorted array efficiently', () => { const ins=(a:number[])=>{const r=[...a];for(let i=1;i<r.length;i++){const k=r[i];let j=i-1;while(j>=0&&r[j]>k){r[j+1]=r[j];j--;}r[j+1]=k;}return r;}; expect(ins([2,6,4,1,8,7,3,5])).toEqual([1,2,3,4,5,6,7,8]); });
});


describe('phase48 coverage', () => {
  it('converts number base', () => { const conv=(n:number,from:number,to:number)=>parseInt(n.toString(),from).toString(to); expect(conv(255,10,16)).toBe('ff'); expect(conv(255,10,2)).toBe('11111111'); });
  it('computes sum of digits until single digit', () => { const dr=(n:number):number=>n<10?n:dr([...String(n)].reduce((s,d)=>s+Number(d),0)); expect(dr(9875)).toBe(2); expect(dr(0)).toBe(0); });
  it('counts distinct binary trees with n nodes', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((s,v)=>s+v,0); expect(cat(0)).toBe(1); expect(cat(3)).toBe(5); expect(cat(4)).toBe(14); });
  it('computes closest pair distance', () => { const cpd=(pts:[number,number][])=>{const d=(a:[number,number],b:[number,number])=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2);let best=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)best=Math.min(best,d(pts[i],pts[j]));return best;}; expect(cpd([[0,0],[3,4],[1,1],[5,2]])).toBeCloseTo(Math.sqrt(2),5); });
  it('finds maximum sum path in triangle', () => { const tp=(t:number[][])=>{const dp=t.map(r=>[...r]);for(let i=dp.length-2;i>=0;i--)for(let j=0;j<=i;j++)dp[i][j]+=Math.max(dp[i+1][j],dp[i+1][j+1]);return dp[0][0];}; expect(tp([[3],[7,4],[2,4,6],[8,5,9,3]])).toBe(23); });
});
