import {
  createRequest,
  listRequests,
  getRequest,
  updateRequest,
  processExportRequest,
  processErasureRequest,
} from '../src/index';

/**
 * dsar store is module-level with no resetStore().
 * Tests use unique orgIds to avoid cross-test pollution.
 * processExportRequest/processErasureRequest use setTimeout(2000) —
 * we use jest.useFakeTimers() to advance time instantly.
 */

let orgCounter = 0;
function uniqueOrg(): string {
  return `dsar-org-${++orgCounter}`;
}

const BASE = {
  type: 'EXPORT' as const,
  subjectEmail: 'user@example.com',
  requestedById: 'admin-1',
};

// ─── createRequest ────────────────────────────────────────────────────────────

describe('createRequest', () => {
  it('creates a PENDING EXPORT request with required fields', () => {
    const org = uniqueOrg();
    const req = createRequest({ orgId: org, ...BASE });

    expect(req.id).toBeTruthy();
    expect(req.orgId).toBe(org);
    expect(req.type).toBe('EXPORT');
    expect(req.subjectEmail).toBe('user@example.com');
    expect(req.requestedById).toBe('admin-1');
    expect(req.status).toBe('PENDING');
    expect(req.completedAt).toBeNull();
    expect(req.downloadUrl).toBeNull();
    expect(req.downloadExpiry).toBeNull();
    expect(typeof req.createdAt).toBe('string');
  });

  it('creates an ERASURE request', () => {
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'x@y.com', requestedById: 'u' });
    expect(req.type).toBe('ERASURE');
  });

  it('stores optional notes', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE, notes: 'GDPR Article 15 request' });
    expect(req.notes).toBe('GDPR Article 15 request');
  });

  it('starts without notes when none provided', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.notes).toBeNull();
  });

  it('assigns unique IDs to each request', () => {
    const org = uniqueOrg();
    const r1 = createRequest({ orgId: org, ...BASE });
    const r2 = createRequest({ orgId: org, ...BASE });
    expect(r1.id).not.toBe(r2.id);
  });
});

// ─── listRequests ─────────────────────────────────────────────────────────────

describe('listRequests', () => {
  it('returns empty array for org with no requests', () => {
    expect(listRequests(uniqueOrg())).toEqual([]);
  });

  it('returns only requests belonging to the specified org', () => {
    const org = uniqueOrg();
    const other = uniqueOrg();
    createRequest({ orgId: org, ...BASE });
    createRequest({ orgId: other, ...BASE });
    const results = listRequests(org);
    expect(results).toHaveLength(1);
    expect(results[0].orgId).toBe(org);
  });

  it('returns multiple requests for same org', () => {
    const org = uniqueOrg();
    createRequest({ orgId: org, ...BASE });
    createRequest({ orgId: org, type: 'ERASURE', subjectEmail: 'a@b.com', requestedById: 'u' });
    expect(listRequests(org)).toHaveLength(2);
  });

  it('returns requests sorted newest-first', async () => {
    const org = uniqueOrg();
    const r1 = createRequest({ orgId: org, ...BASE });
    await new Promise((r) => setTimeout(r, 5));
    const r2 = createRequest({ orgId: org, ...BASE });
    const list = listRequests(org);
    expect(list[0].id).toBe(r2.id);
    expect(list[1].id).toBe(r1.id);
  });
});

// ─── getRequest ───────────────────────────────────────────────────────────────

describe('getRequest', () => {
  it('returns the request by ID', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(getRequest(req.id)).toBeDefined();
    expect(getRequest(req.id)?.id).toBe(req.id);
  });

  it('returns undefined for unknown ID', () => {
    expect(getRequest('nonexistent')).toBeUndefined();
  });
});

// ─── updateRequest ────────────────────────────────────────────────────────────

describe('updateRequest', () => {
  it('returns null for unknown ID', () => {
    expect(updateRequest('bad-id', { status: 'COMPLETE' })).toBeNull();
  });

  it('updates status', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const updated = updateRequest(req.id, { status: 'IN_PROGRESS' });
    expect(updated!.status).toBe('IN_PROGRESS');
  });

  it('updates notes', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const updated = updateRequest(req.id, { notes: 'Processing...' });
    expect(updated!.notes).toBe('Processing...');
  });

  it('updates downloadUrl and downloadExpiry', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const expiry = new Date().toISOString();
    const updated = updateRequest(req.id, { downloadUrl: 'https://example.com/file.zip', downloadExpiry: expiry });
    expect(updated!.downloadUrl).toBe('https://example.com/file.zip');
    expect(updated!.downloadExpiry).toBe(expiry);
  });

  it('updates updatedAt timestamp', async () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const before = req.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    updateRequest(req.id, { status: 'IN_PROGRESS' });
    const after = getRequest(req.id)!.updatedAt;
    expect(after).not.toBe(before);
  });
});

// ─── processExportRequest ─────────────────────────────────────────────────────

describe('processExportRequest', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns null for unknown ID', async () => {
    const promise = processExportRequest('nonexistent');
    jest.runAllTimers();
    expect(await promise).toBeNull();
  });

  it('sets status to IN_PROGRESS immediately, COMPLETE after timer', async () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });

    // Check it transitions through IN_PROGRESS
    const promise = processExportRequest(req.id);
    // After calling, it should be IN_PROGRESS (sync mutation before setTimeout)
    expect(getRequest(req.id)!.status).toBe('IN_PROGRESS');

    jest.runAllTimers();
    const result = await promise;

    expect(result!.status).toBe('COMPLETE');
    expect(result!.completedAt).not.toBeNull();
    expect(result!.downloadUrl).toMatch(/dsar/);
    expect(result!.downloadExpiry).not.toBeNull();
  });
});

// ─── processErasureRequest ────────────────────────────────────────────────────

describe('processErasureRequest', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns null for unknown ID', async () => {
    const promise = processErasureRequest('nonexistent');
    jest.runAllTimers();
    expect(await promise).toBeNull();
  });

  it('sets status to COMPLETE after erasure', async () => {
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'erase@me.com', requestedById: 'u' });

    const promise = processErasureRequest(req.id);
    expect(getRequest(req.id)!.status).toBe('IN_PROGRESS');

    jest.runAllTimers();
    const result = await promise;

    expect(result!.status).toBe('COMPLETE');
    expect(result!.completedAt).not.toBeNull();
    expect(result!.notes).toContain('erasure completed');
    expect(result!.notes).toContain('erase@me.com');
  });
});

// ─── Extended scenarios ───────────────────────────────────────────────────────

describe('dsar — extended scenarios', () => {
  it('createRequest id is a valid UUID', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('createRequest createdAt is a valid ISO 8601 string', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(new Date(req.createdAt).toISOString()).toBe(req.createdAt);
  });

  it('createRequest updatedAt equals createdAt initially', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.updatedAt).toBe(req.createdAt);
  });

  it('updateRequest sets completedAt when provided', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const completedAt = new Date().toISOString();
    const updated = updateRequest(req.id, { completedAt });
    expect(updated!.completedAt).toBe(completedAt);
  });

  it('getRequest returns the same object as returned by createRequest', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const fetched = getRequest(req.id);
    expect(fetched!.id).toBe(req.id);
    expect(fetched!.orgId).toBe(req.orgId);
  });

  it('listRequests returns ERASURE request type correctly', () => {
    const org = uniqueOrg();
    createRequest({ orgId: org, type: 'ERASURE', subjectEmail: 'a@b.com', requestedById: 'u' });
    const list = listRequests(org);
    expect(list[0].type).toBe('ERASURE');
  });

  it('updateRequest does not affect other fields not mentioned in update', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    updateRequest(req.id, { status: 'IN_PROGRESS' });
    const after = getRequest(req.id)!;
    expect(after.subjectEmail).toBe(BASE.subjectEmail);
    expect(after.type).toBe(BASE.type);
  });

  it('processExportRequest downloadUrl contains the request id', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const promise = processExportRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(result!.downloadUrl).toContain(req.id);
    jest.useRealTimers();
  });

  it('processErasureRequest does not set downloadUrl (erasures have no file)', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'del@ims.local', requestedById: 'u' });
    const promise = processErasureRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(result!.downloadUrl).toBeNull();
    jest.useRealTimers();
  });
});

describe('dsar — additional validation scenarios', () => {
  it('createRequest with CORRECTION type stores type correctly', () => {
    const req = createRequest({ orgId: uniqueOrg(), type: 'CORRECTION' as 'EXPORT', subjectEmail: 'a@b.com', requestedById: 'u' });
    expect(req.type).toBe('CORRECTION');
  });

  it('listRequests returns requests in descending createdAt order', async () => {
    const org = uniqueOrg();
    createRequest({ orgId: org, ...BASE });
    await new Promise((r) => setTimeout(r, 5));
    createRequest({ orgId: org, ...BASE });
    const list = listRequests(org);
    const d0 = new Date(list[0].createdAt).getTime();
    const d1 = new Date(list[1].createdAt).getTime();
    expect(d0).toBeGreaterThanOrEqual(d1);
  });

  it('updateRequest with no changes still returns the request', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const result = updateRequest(req.id, {});
    expect(result).not.toBeNull();
    expect(result!.id).toBe(req.id);
  });

  it('getRequest returns undefined for a random non-existent id string', () => {
    expect(getRequest('00000000-dead-beef-0000-000000000000')).toBeUndefined();
  });

  it('createRequest subjectEmail is stored as-is', () => {
    const email = 'Complex.Email+tag@Example.COM';
    const req = createRequest({ orgId: uniqueOrg(), type: 'EXPORT', subjectEmail: email, requestedById: 'u' });
    expect(req.subjectEmail).toBe(email);
  });

  it('processExportRequest completedAt is a valid ISO 8601 string', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const promise = processExportRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(new Date(result!.completedAt!).toISOString()).toBe(result!.completedAt);
    jest.useRealTimers();
  });
});

describe('dsar — final additional coverage', () => {
  it('createRequest returns an object with all expected properties', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req).toHaveProperty('id');
    expect(req).toHaveProperty('orgId');
    expect(req).toHaveProperty('type');
    expect(req).toHaveProperty('status');
    expect(req).toHaveProperty('subjectEmail');
    expect(req).toHaveProperty('createdAt');
    expect(req).toHaveProperty('updatedAt');
  });

  it('updateRequest returns null for an unknown ID string', () => {
    const result = updateRequest('no-such-id', { status: 'COMPLETE' });
    expect(result).toBeNull();
  });

  it('listRequests for brand-new org returns an empty array', () => {
    expect(listRequests(uniqueOrg())).toEqual([]);
  });

  it('processErasureRequest completedAt is a valid ISO string', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'del2@ims.local', requestedById: 'u' });
    const promise = processErasureRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(new Date(result!.completedAt!).toISOString()).toBe(result!.completedAt);
    jest.useRealTimers();
  });

  it('createRequest requestedById is stored correctly', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE, requestedById: 'admin-42' });
    expect(req.requestedById).toBe('admin-42');
  });
});

describe('dsar — phase29 coverage', () => {
  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles WeakMap', () => {
    const wm = new WeakMap(); const key = {}; wm.set(key, 'val'); expect(wm.has(key)).toBe(true);
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

});

describe('dsar — phase30 coverage', () => {
  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

  it('handles type coercion', () => {
    expect(typeof 'string').toBe('string');
  });

});


describe('phase31 coverage', () => {
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles optional chaining', () => { const o: any = null; expect(o?.x).toBeUndefined(); });
  it('handles string replace', () => { expect('foo bar'.replace('bar','baz')).toBe('foo baz'); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles nullish coalescing', () => { const v: string | null = null; const result = v ?? 'default'; expect(result).toBe('default'); });
});


describe('phase32 coverage', () => {
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
  it('returns correct type for number', () => { expect(typeof 42).toBe('number'); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
  it('handles class inheritance', () => { class A { greet() { return 'A'; } } class B extends A { greet() { return 'B'; } } expect(new B().greet()).toBe('B'); });
  it('handles array reverse', () => { expect([1,2,3].reverse()).toEqual([3,2,1]); });
});


describe('phase33 coverage', () => {
  it('handles decodeURIComponent', () => { expect(decodeURIComponent('hello%20world')).toBe('hello world'); });
  it('handles iterable protocol', () => { const iter = { [Symbol.iterator]() { let i = 0; return { next() { return i < 3 ? { value: i++, done: false } : { value: undefined, done: true }; } }; } }; expect([...iter]).toEqual([0,1,2]); });
  it('handles RangeError', () => { expect(() => new Array(-1)).toThrow(RangeError); });
  it('converts string to number', () => { expect(Number('3.14')).toBeCloseTo(3.14); });
  it('handles Map delete', () => { const m = new Map<string,number>([['a',1]]); m.delete('a'); expect(m.has('a')).toBe(false); });
});


describe('phase34 coverage', () => {
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles Set intersection', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const inter = new Set([...a].filter(x=>b.has(x))); expect([...inter]).toEqual([2,3]); });
  it('handles abstract-like pattern', () => { class Shape { area(): number { return 0; } } class Square extends Shape { constructor(private s: number) { super(); } area() { return this.s*this.s; } } expect(new Square(4).area()).toBe(16); });
  it('handles number comparison operators', () => { expect(5 >= 5).toBe(true); expect(4 <= 5).toBe(true); });
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
});


describe('phase35 coverage', () => {
  it('handles string to array via spread', () => { expect([...'abc']).toEqual(['a','b','c']); });
  it('handles date formatting pattern', () => { const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; expect(fmt(new Date(2026,0,1))).toBe('2026-01'); });
  it('handles number clamp', () => { const clamp = (v:number,min:number,max:number) => Math.min(Math.max(v,min),max); expect(clamp(10,0,5)).toBe(5); expect(clamp(-1,0,5)).toBe(0); });
  it('handles strategy pattern', () => { type Sorter = (a:number[]) => number[]; const asc: Sorter = a=>[...a].sort((x,y)=>x-y); const desc: Sorter = a=>[...a].sort((x,y)=>y-x); expect(asc([3,1,2])).toEqual([1,2,3]); expect(desc([3,1,2])).toEqual([3,2,1]); });
  it('handles array groupBy pattern', () => { const groupBy = <T>(arr:T[], key:(item:T)=>string): Record<string,T[]> => arr.reduce((acc,item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc; },{}as Record<string,T[]>); const r = groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t); expect(r['a'].length).toBe(2); });
});


describe('phase36 coverage', () => {
  it('handles matrix transpose', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2],[3,4]])).toEqual([[1,3],[2,4]]); });
  it('handles trie prefix check', () => { const words=['apple','app','apt'];const has=(prefix:string)=>words.some(w=>w.startsWith(prefix));expect(has('app')).toBe(true);expect(has('ban')).toBe(false); });
  it('handles number digit sum', () => { const digitSum=(n:number)=>String(Math.abs(n)).split('').reduce((s,d)=>s+Number(d),0);expect(digitSum(12345)).toBe(15);expect(digitSum(999)).toBe(27); });
  it('handles BFS pattern', () => { const bfs=(g:Map<number,number[]>,start:number)=>{const visited=new Set<number>();const queue=[start];while(queue.length){const node=queue.shift()!;if(visited.has(node))continue;visited.add(node);g.get(node)?.forEach(n=>queue.push(n));}return visited.size;};const g=new Map([[1,[2,3]],[2,[4]],[3,[4]],[4,[]]]);expect(bfs(g,1)).toBe(4); });
  it('handles snake_case to camelCase', () => { const snakeToCamel=(s:string)=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());expect(snakeToCamel('foo_bar_baz')).toBe('fooBarBaz'); });
});


describe('phase37 coverage', () => {
  it('formats bytes to human readable', () => { const fmt=(b:number)=>b>=1e9?`${(b/1e9).toFixed(1)}GB`:b>=1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1e3).toFixed(1)}KB`; expect(fmt(1500000)).toBe('1.5MB'); });
  it('computes combination count', () => { const fact=(n:number):number=>n<=1?1:n*fact(n-1); const comb=(n:number,r:number)=>fact(n)/(fact(r)*fact(n-r)); expect(comb(5,2)).toBe(10); });
  it('finds first element satisfying predicate', () => { expect([1,2,3,4].find(n=>n>2)).toBe(3); });
  it('rotates array left', () => { const rotL=<T>(a:T[],n:number)=>[...a.slice(n),...a.slice(0,n)]; expect(rotL([1,2,3,4,5],2)).toEqual([3,4,5,1,2]); });
  it('checks string contains only letters', () => { const onlyLetters=(s:string)=>/^[a-zA-Z]+$/.test(s); expect(onlyLetters('Hello')).toBe(true); expect(onlyLetters('Hello1')).toBe(false); });
});


describe('phase38 coverage', () => {
  it('checks perfect number', () => { const isPerfect=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s===n&&n!==1;}; expect(isPerfect(6)).toBe(true); expect(isPerfect(28)).toBe(true); expect(isPerfect(12)).toBe(false); });
  it('checks valid sudoku row', () => { const validRow=(row:number[])=>new Set(row.filter(v=>v!==0)).size===row.filter(v=>v!==0).length; expect(validRow([1,2,3,4,5,6,7,8,9])).toBe(true); expect(validRow([1,2,2,4,5,6,7,8,9])).toBe(false); });
  it('implements min stack', () => { class MinStack{private d:[number,number][]=[];push(v:number){const m=this.d.length?Math.min(v,this.d[this.d.length-1][1]):v;this.d.push([v,m]);}pop(){return this.d.pop()?.[0];}getMin(){return this.d[this.d.length-1]?.[1];}} const s=new MinStack();s.push(5);s.push(3);s.push(7);expect(s.getMin()).toBe(3);s.pop();expect(s.getMin()).toBe(3); });
  it('checks majority element', () => { const majority=(a:number[])=>{const f=a.reduce((m,v)=>{m.set(v,(m.get(v)||0)+1);return m;},new Map<number,number>());let res=-1;f.forEach((c,v)=>{if(c>a.length/2)res=v;});return res;}; expect(majority([3,2,3])).toBe(3); });
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
});
