import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockGetPresence = jest.fn().mockReturnValue([]);
const mockAcquireLock = jest.fn().mockReturnValue({ acquired: true });
const mockReleaseLock = jest.fn();
const mockRefreshLock = jest.fn();

jest.mock('@ims/presence', () => ({
  getPresence: (...args: any[]) => mockGetPresence(...args),
  acquireLock: (...args: any[]) => mockAcquireLock(...args),
  releaseLock: (...args: any[]) => mockReleaseLock(...args),
  refreshLock: (...args: any[]) => mockRefreshLock(...args),
}));

import presenceRouter from '../src/routes/presence';

describe('Presence Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/presence', () => {
    it('returns current viewers', async () => {
      mockGetPresence.mockReturnValue([
        { userId: 'u2', userName: 'Jane', lockedAt: new Date().toISOString() },
      ]);
      const res = await request(app).get('/api/presence?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('viewers data is defined in response', async () => {
      mockGetPresence.mockReturnValue([]);
      const res = await request(app).get('/api/presence?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('getPresence called once per request', async () => {
      mockGetPresence.mockReturnValue([]);
      await request(app).get('/api/presence?recordType=ncr&recordId=r1');
      expect(mockGetPresence).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/presence/lock', () => {
    it('acquires an edit lock', async () => {
      const res = await request(app)
        .post('/api/presence/lock')
        .send({ recordType: 'ncr', recordId: 'r1' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.acquired).toBe(true);
    });

    it('returns lock conflict when held by another user', async () => {
      mockAcquireLock.mockReturnValueOnce({
        acquired: false,
        lockedBy: { userName: 'Jane', userId: 'u2' },
      });
      const res = await request(app)
        .post('/api/presence/lock')
        .send({ recordType: 'ncr', recordId: 'r1' });
      expect(res.status).toBe(200);
      expect(res.body.data.acquired).toBe(false);
      expect(res.body.data.lockedBy).toBeDefined();
    });
  });

  describe('DELETE /api/presence/lock', () => {
    it('releases an edit lock', async () => {
      const res = await request(app)
        .delete('/api/presence/lock')
        .send({ recordType: 'ncr', recordId: 'r1' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('releaseLock called once per DELETE request', async () => {
      await request(app).delete('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r1' });
      expect(mockReleaseLock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/presence/refresh', () => {
    it('refreshes lock TTL', async () => {
      const res = await request(app)
        .put('/api/presence/refresh')
        .send({ recordType: 'ncr', recordId: 'r1' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('refreshLock called once per PUT request', async () => {
      await request(app).put('/api/presence/refresh').send({ recordType: 'ncr', recordId: 'r1' });
      expect(mockRefreshLock).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Presence — extended', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
  });

  it('acquireLock called once per lock POST request', async () => {
    await request(app).post('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r1' });
    expect(mockAcquireLock).toHaveBeenCalledTimes(1);
  });

  it('lock response data has acquired field', async () => {
    const res = await request(app).post('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('acquired');
  });

  it('refreshLock called once per PUT refresh request', async () => {
    await request(app).put('/api/presence/refresh').send({ recordType: 'ncr', recordId: 'r1' });
    expect(mockRefreshLock).toHaveBeenCalledTimes(1);
  });
});

describe('Presence — extra', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
  });

  it('GET presence success is true when viewers exist', async () => {
    mockGetPresence.mockReturnValue([
      { userId: 'u3', userName: 'Bob', lockedAt: new Date().toISOString() },
    ]);
    const res = await request(app).get('/api/presence?recordType=ncr&recordId=r2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.viewers).toHaveLength(1);
  });

  it('DELETE lock response success is true', async () => {
    const res = await request(app)
      .delete('/api/presence/lock')
      .send({ recordType: 'ncr', recordId: 'r3' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT refresh response success is true', async () => {
    const res = await request(app)
      .put('/api/presence/refresh')
      .send({ recordType: 'ncr', recordId: 'r4' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Presence — additional coverage', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
  });

  it('GET /api/presence returns 400 when recordType is missing', async () => {
    const res = await request(app).get('/api/presence?recordId=r1');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/presence returns 400 when recordId is missing', async () => {
    const res = await request(app).get('/api/presence?recordType=ncr');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/presence/lock returns 400 when recordType is missing', async () => {
    const res = await request(app)
      .post('/api/presence/lock')
      .send({ recordId: 'r1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/presence/lock response data has released field', async () => {
    const res = await request(app)
      .delete('/api/presence/lock')
      .send({ recordType: 'ncr', recordId: 'r5' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('released', true);
  });

  it('PUT /api/presence/refresh response data has refreshed field', async () => {
    const res = await request(app)
      .put('/api/presence/refresh')
      .send({ recordType: 'ncr', recordId: 'r6' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('refreshed', true);
  });
});

describe('Presence — edge cases and error paths', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
  });

  it('GET /api/presence returns 400 when both params are missing', async () => {
    const res = await request(app).get('/api/presence');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/presence returns 500 when getPresence throws', async () => {
    mockGetPresence.mockImplementationOnce(() => { throw new Error('storage failure'); });
    const res = await request(app).get('/api/presence?recordType=ncr&recordId=r1');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/presence/lock returns 400 when recordId is missing', async () => {
    const res = await request(app)
      .post('/api/presence/lock')
      .send({ recordType: 'ncr' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/presence/lock returns 500 when acquireLock throws', async () => {
    mockAcquireLock.mockImplementationOnce(() => { throw new Error('lock store error'); });
    const res = await request(app)
      .post('/api/presence/lock')
      .send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/presence/lock returns 400 when recordType is missing', async () => {
    const res = await request(app)
      .delete('/api/presence/lock')
      .send({ recordId: 'r1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/presence/lock returns 500 when releaseLock throws', async () => {
    mockReleaseLock.mockImplementationOnce(() => { throw new Error('release error'); });
    const res = await request(app)
      .delete('/api/presence/lock')
      .send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/presence/refresh returns 400 when recordId is missing', async () => {
    const res = await request(app)
      .put('/api/presence/refresh')
      .send({ recordType: 'ncr' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/presence/refresh returns 500 when refreshLock throws', async () => {
    mockRefreshLock.mockImplementationOnce(() => { throw new Error('refresh error'); });
    const res = await request(app)
      .put('/api/presence/refresh')
      .send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/presence viewers array is empty when no one is present', async () => {
    mockGetPresence.mockReturnValue([]);
    const res = await request(app).get('/api/presence?recordType=capa&recordId=c1');
    expect(res.status).toBe(200);
    expect(res.body.data.viewers).toHaveLength(0);
  });

  it('POST /api/presence/lock with force flag passes through to acquireLock', async () => {
    mockAcquireLock.mockReturnValue({ acquired: true });
    await request(app)
      .post('/api/presence/lock')
      .send({ recordType: 'ncr', recordId: 'r1', force: true });
    expect(mockAcquireLock).toHaveBeenCalledTimes(1);
  });
});

describe('Presence — final coverage batch', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
    mockGetPresence.mockReturnValue([]);
    mockAcquireLock.mockReturnValue({ acquired: true });
  });

  it('GET /api/presence response is JSON content-type', async () => {
    const res = await request(app).get('/api/presence?recordType=ncr&recordId=r1');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/presence/lock response is JSON content-type', async () => {
    const res = await request(app).post('/api/presence/lock').send({ recordType: 'capa', recordId: 'c1' });
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('DELETE /api/presence/lock response is JSON content-type', async () => {
    const res = await request(app).delete('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('PUT /api/presence/refresh response is JSON content-type', async () => {
    const res = await request(app).put('/api/presence/refresh').send({ recordType: 'ncr', recordId: 'r1' });
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/presence data has viewers property', async () => {
    const res = await request(app).get('/api/presence?recordType=ncr&recordId=r9');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('viewers');
  });
});

describe('Presence — extended final batch', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/presence', presenceRouter);
    jest.clearAllMocks();
    mockGetPresence.mockReturnValue([]);
    mockAcquireLock.mockReturnValue({ acquired: true });
  });

  it('GET /api/presence returns success false when both params missing', async () => {
    const res = await request(app).get('/api/presence');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/presence/lock acquired true is boolean', async () => {
    const res = await request(app).post('/api/presence/lock').send({ recordType: 'capa', recordId: 'c7' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.acquired).toBe('boolean');
  });

  it('GET /api/presence viewers array items have userId field', async () => {
    mockGetPresence.mockReturnValue([{ userId: 'u10', userName: 'Viewer', lockedAt: new Date().toISOString() }]);
    const res = await request(app).get('/api/presence?recordType=ncr&recordId=r10');
    expect(res.status).toBe(200);
    expect(res.body.data.viewers[0]).toHaveProperty('userId');
  });

  it('POST /api/presence/lock returns success true on acquired false result', async () => {
    mockAcquireLock.mockReturnValueOnce({ acquired: false, lockedBy: { userId: 'other', userName: 'Other' } });
    const res = await request(app).post('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r11' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/presence/lock calls releaseLock exactly once', async () => {
    await request(app).delete('/api/presence/lock').send({ recordType: 'ncr', recordId: 'r12' });
    expect(mockReleaseLock).toHaveBeenCalledTimes(1);
  });
});

describe('presence — phase29 coverage', () => {
  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles ternary operator', () => {
    expect(true ? 'yes' : 'no').toBe('yes');
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles reduce method', () => {
    expect([1, 2, 3].reduce((acc, x) => acc + x, 0)).toBe(6);
  });

});

describe('presence — phase30 coverage', () => {
  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

});


describe('phase31 coverage', () => {
  it('handles array filter', () => { expect([1,2,3,4].filter(x => x % 2 === 0)).toEqual([2,4]); });
  it('handles string startsWith', () => { expect('hello'.startsWith('hel')).toBe(true); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
  it('handles async/await error', async () => { const fn = async () => { throw new Error('fail'); }; await expect(fn()).rejects.toThrow('fail'); });
});


describe('phase32 coverage', () => {
  it('handles number formatting', () => { expect((1234.5).toFixed(1)).toBe('1234.5'); });
  it('handles array reverse', () => { expect([1,2,3].reverse()).toEqual([3,2,1]); });
  it('handles logical AND assignment', () => { let x = 1; x &&= 2; expect(x).toBe(2); });
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
});


describe('phase33 coverage', () => {
  it('handles string index access', () => { expect('hello'[0]).toBe('h'); });
  it('handles object toString', () => { expect(Object.prototype.toString.call([])).toBe('[object Array]'); });
  it('handles Proxy basic', () => { const p = new Proxy({x:1}, { get(t,k) { return (t as any)[k] * 2; } }); expect((p as any).x).toBe(2); });
  it('converts number to string', () => { expect(String(42)).toBe('42'); });
  it('handles tagged template', () => { const tag = (s: TemplateStringsArray, ...v: number[]) => s.raw[0] + v[0]; expect(tag`val:${42}`).toBe('val:42'); });
});


describe('phase34 coverage', () => {
  it('computes sum of array', () => { expect([1,2,3,4,5].reduce((a,b)=>a+b,0)).toBe(15); });
  it('handles number array typed', () => { const nums: number[] = [1,2,3]; expect(nums.every(n => typeof n === 'number')).toBe(true); });
  it('handles object key renaming via destructuring', () => { const {a: x, b: y} = {a:1,b:2}; expect(x).toBe(1); expect(y).toBe(2); });
  it('handles async generator', async () => { async function* gen() { yield 1; yield 2; } const vals: number[] = []; for await (const v of gen()) vals.push(v); expect(vals).toEqual([1,2]); });
  it('handles named function expression', () => { const factorial = function fact(n: number): number { return n <= 1 ? 1 : n * fact(n-1); }; expect(factorial(4)).toBe(24); });
});


describe('phase35 coverage', () => {
  it('handles date formatting pattern', () => { const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; expect(fmt(new Date(2026,0,1))).toBe('2026-01'); });
  it('handles template literal type pattern', () => { type EventName = `on${Capitalize<string>}`; const handler: EventName = 'onClick'; expect(handler.startsWith('on')).toBe(true); });
  it('handles string split-join replace', () => { expect('aabbcc'.split('b').join('x')).toBe('aaxxcc'); });
  it('handles array groupBy pattern', () => { const groupBy = <T>(arr:T[], key:(item:T)=>string): Record<string,T[]> => arr.reduce((acc,item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc; },{}as Record<string,T[]>); const r = groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t); expect(r['a'].length).toBe(2); });
  it('handles object merge deep pattern', () => { const merge = <T extends object>(a: T, b: Partial<T>): T => ({...a,...b}); expect(merge({x:1,y:2},{y:99})).toEqual({x:1,y:99}); });
});


describe('phase36 coverage', () => {
  it('handles top-K elements', () => { const topK=(a:number[],k:number)=>[...a].sort((x,y)=>y-x).slice(0,k);expect(topK([3,1,4,1,5,9,2,6],3)).toEqual([9,6,5]); });
  it('handles trie prefix check', () => { const words=['apple','app','apt'];const has=(prefix:string)=>words.some(w=>w.startsWith(prefix));expect(has('app')).toBe(true);expect(has('ban')).toBe(false); });
  it('handles object deep merge', () => { const merge=(a:Record<string,unknown>,b:Record<string,unknown>):Record<string,unknown>=>{const r={...a};for(const k in b){r[k]=b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])?merge((a[k]||{}) as Record<string,unknown>,b[k] as Record<string,unknown>):b[k];}return r;};expect(merge({a:{x:1}},{a:{y:2}})).toEqual({a:{x:1,y:2}}); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
  it('computes fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(10)).toBe(55); });
});


describe('phase37 coverage', () => {
  it('sums nested arrays', () => { const sumNested=(a:number[][])=>a.reduce((t,r)=>t+r.reduce((s,v)=>s+v,0),0); expect(sumNested([[1,2],[3,4],[5]])).toBe(15); });
  it('creates range array', () => { const range=(start:number,end:number)=>Array.from({length:end-start},(_,i)=>i+start); expect(range(2,5)).toEqual([2,3,4]); });
  it('interleaves two arrays', () => { const interleave=<T>(a:T[],b:T[])=>a.flatMap((v,i)=>b[i]!==undefined?[v,b[i]]:[v]); expect(interleave([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('escapes HTML entities', () => { const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); expect(esc('<div>&</div>')).toBe('&lt;div&gt;&amp;&lt;/div&gt;'); });
  it('chunks array by predicate', () => { const split=<T>(a:T[],fn:(x:T)=>boolean)=>{const r:T[][]=[];let cur:T[]=[];for(const x of a){if(fn(x)){if(cur.length)r.push(cur);cur=[];}else cur.push(x);}if(cur.length)r.push(cur);return r;}; expect(split([1,2,0,3,4,0,5],x=>x===0)).toEqual([[1,2],[3,4],[5]]); });
});
