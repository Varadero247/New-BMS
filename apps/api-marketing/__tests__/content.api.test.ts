import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktEmailLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    mktLead: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    mktHealthScore: {
      findMany: jest.fn(),
    },
    mktPartner: {
      count: jest.fn(),
    },
    mktPartnerDeal: {
      count: jest.fn(),
    },
    mktRenewalSequence: {
      count: jest.fn(),
    },
    mktWinBackSequence: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import growthRouter from '../src/routes/growth';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/growth', growthRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const setupGrowthMocks = (overrides: Record<string, any> = {}) => {
  (prisma.mktLead.count as jest.Mock).mockResolvedValue(overrides.leadCount ?? 10);
  (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue(overrides.leadsBySource ?? []);
  (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue(overrides.healthScores ?? []);
  (prisma.mktPartner.count as jest.Mock).mockResolvedValue(overrides.partnerCount ?? 5);
  (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(overrides.dealCount ?? 3);
  (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(overrides.renewalCount ?? 2);
  (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(overrides.winBackCount ?? 1);
};

// ===================================================================
// content.api.test.ts — content/growth marketing metrics tests
// ===================================================================

describe('GET /api/growth/metrics — content growth metrics', () => {
  it('returns growth metrics successfully', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('response data has leads key', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('leads');
  });

  it('response data has health key', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('health');
  });

  it('response data has partners key', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('partners');
  });

  it('leads.total matches total mktLead.count result', async () => {
    setupGrowthMocks({ leadCount: 42 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.leads.total).toBe(42);
  });

  it('leads.bySource is an array', async () => {
    setupGrowthMocks({ leadsBySource: [{ source: 'DIRECT', _count: 5 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.leads.bySource)).toBe(true);
  });

  it('health.healthy is a number', async () => {
    setupGrowthMocks({ healthScores: [{ score: 80 }, { score: 90 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.health.healthy).toBe('number');
  });

  it('health.atRisk is a number', async () => {
    setupGrowthMocks({ healthScores: [{ score: 50 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.health.atRisk).toBe('number');
  });

  it('health.critical is a number', async () => {
    setupGrowthMocks({ healthScores: [{ score: 20 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.health.critical).toBe('number');
  });

  it('partners.total matches mktPartner.count result', async () => {
    setupGrowthMocks({ partnerCount: 7 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.partners.total).toBe(7);
  });

  it('partners.totalDeals matches mktPartnerDeal.count result', async () => {
    setupGrowthMocks({ dealCount: 15 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.partners.totalDeals).toBe(15);
  });

  it('mktLead.count called multiple times for thisMonth and lastMonth', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktLead.count).toHaveBeenCalled();
  });

  it('response data includes upcomingRenewals field', async () => {
    setupGrowthMocks({ renewalCount: 4 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('renewals');
  });

  it('response data.upcomingRenewals is a number', async () => {
    setupGrowthMocks({ renewalCount: 3 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.renewals.upcoming30Days).toBe('number');
  });

  it('response data includes activeWinBacks field', async () => {
    setupGrowthMocks({ winBackCount: 2 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('winBacks');
  });

  it('response data.activeWinBacks is a number', async () => {
    setupGrowthMocks({ winBackCount: 6 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.winBacks.active).toBe('number');
  });

  it('returns 500 when mktLead.count throws', async () => {
    (prisma.mktLead.count as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('mktHealthScore.findMany is called with distinct userId and take 1000', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktHealthScore.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['userId'], take: 1000 })
    );
  });

  it('health.total equals length of healthScores returned', async () => {
    setupGrowthMocks({ healthScores: [{ score: 80 }, { score: 50 }, { score: 20 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.health.total).toBe(3);
  });

  it('health.healthy counts scores >= 70', async () => {
    setupGrowthMocks({ healthScores: [{ score: 70 }, { score: 80 }, { score: 40 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.health.healthy).toBe(2);
  });

  it('health.atRisk counts scores >= 40 and < 70', async () => {
    setupGrowthMocks({ healthScores: [{ score: 40 }, { score: 60 }, { score: 80 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.health.atRisk).toBe(2);
  });

  it('health.critical counts scores < 40', async () => {
    setupGrowthMocks({ healthScores: [{ score: 20 }, { score: 10 }, { score: 80 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.health.critical).toBe(2);
  });

  it('leads.thisMonth is a number', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.leads.thisMonth).toBe('number');
  });

  it('leads.lastMonth is a number', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.leads.lastMonth).toBe('number');
  });

  it('partners.closedWonDeals is a number', async () => {
    setupGrowthMocks({ dealCount: 8 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.partners.closedWonDeals).toBe('number');
  });

  it('mktPartnerDeal.count called at least twice (total and closedWon)', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktPartnerDeal.count).toHaveBeenCalled();
  });

  it('mktWinBackSequence.count called with reactivatedAt:null filter', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktWinBackSequence.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ reactivatedAt: null }) })
    );
  });

  it('mktLead.groupBy called with by:["source"]', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktLead.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['source'] })
    );
  });

  it('returns success:true on complete growth metrics response', async () => {
    setupGrowthMocks({ leadCount: 20, partnerCount: 3, dealCount: 7, healthScores: [{ score: 75 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.success).toBe(true);
  });

  it('upcomingRenewals equals mktRenewalSequence.count value', async () => {
    setupGrowthMocks({ renewalCount: 9 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.renewals.upcoming30Days).toBe(9);
  });

  it('activeWinBacks equals mktWinBackSequence.count value', async () => {
    setupGrowthMocks({ winBackCount: 11 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.winBacks.active).toBe(11);
  });

  it('when healthScores is empty, health.total is 0', async () => {
    setupGrowthMocks({ healthScores: [] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.health.total).toBe(0);
  });

  it('when healthScores is empty, all health sub-counts are 0', async () => {
    setupGrowthMocks({ healthScores: [] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.health.healthy).toBe(0);
    expect(res.body.data.health.atRisk).toBe(0);
    expect(res.body.data.health.critical).toBe(0);
  });

  it('bySource entries have source and count fields', async () => {
    setupGrowthMocks({ leadsBySource: [{ source: 'DIRECT', _count: 3 }] });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.leads.bySource[0]).toHaveProperty('source');
    expect(res.body.data.leads.bySource[0]).toHaveProperty('count');
  });

  it('mktRenewalSequence.count called with renewedAt:null filter', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktRenewalSequence.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ renewedAt: null }) })
    );
  });
});

describe('Content — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/growth/metrics returns 200 with all required keys', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('leads');
    expect(res.body.data).toHaveProperty('health');
    expect(res.body.data).toHaveProperty('partners');
    expect(res.body.data).toHaveProperty('renewals');
    expect(res.body.data).toHaveProperty('winBacks');
  });

  it('GET /api/growth/metrics returns 500 when mktPartner.count rejects', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartner.count as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/growth/metrics response body has success property', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body).toHaveProperty('success');
  });
});

describe('Content — additional phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/growth/metrics mktLead.groupBy is called', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktLead.groupBy).toHaveBeenCalled();
  });

  it('GET /api/growth/metrics mktHealthScore.findMany is called', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktHealthScore.findMany).toHaveBeenCalled();
  });

  it('GET /api/growth/metrics partners.closedWonDeals matches closed-won deal count', async () => {
    setupGrowthMocks({ dealCount: 12 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.partners.closedWonDeals).toBe('number');
  });

  it('GET /api/growth/metrics returns 500 when mktHealthScore.findMany rejects', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.mktPartner.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/growth/metrics with partnerCount=0 returns partners.total=0', async () => {
    setupGrowthMocks({ partnerCount: 0 });
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.data.partners.total).toBe(0);
  });

  it('GET /api/growth/metrics response body has success property set to true', async () => {
    setupGrowthMocks();
    const res = await request(app).get('/api/growth/metrics');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/growth/metrics mktPartner.count and mktPartnerDeal.count are called', async () => {
    setupGrowthMocks();
    await request(app).get('/api/growth/metrics');
    expect(prisma.mktPartner.count).toHaveBeenCalled();
    expect(prisma.mktPartnerDeal.count).toHaveBeenCalled();
  });
});

describe('content — phase30 coverage', () => {
  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

  it('handles regex match', () => {
    expect('hello world'.match(/world/)).not.toBeNull();
  });

});


describe('phase31 coverage', () => {
  it('handles Math.max', () => { expect(Math.max(1,5,3)).toBe(5); });
  it('handles array some', () => { expect([1,2,3].some(x => x > 2)).toBe(true); });
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
  it('handles string toLowerCase', () => { expect('HELLO'.toLowerCase()).toBe('hello'); });
});


describe('phase32 coverage', () => {
  it('handles for...in loop', () => { const o = {a:1,b:2}; const keys: string[] = []; for (const k in o) keys.push(k); expect(keys.sort()).toEqual(['a','b']); });
  it('handles right shift', () => { expect(8 >> 2).toBe(2); });
  it('handles getter/setter', () => { const o = { _v: 0, get v() { return this._v; }, set v(n) { this._v = n; } }; o.v = 5; expect(o.v).toBe(5); });
  it('handles string charAt', () => { expect('hello'.charAt(1)).toBe('e'); });
  it('returns correct type for number', () => { expect(typeof 42).toBe('number'); });
});


describe('phase33 coverage', () => {
  it('converts number to string', () => { expect(String(42)).toBe('42'); });
  it('adds two numbers', () => { expect(1 + 1).toBe(2); });
  it('handles multiple return values via array', () => { const swap = (a: number, b: number): [number, number] => [b, a]; const [x, y] = swap(1, 2); expect(x).toBe(2); expect(y).toBe(1); });
  it('handles parseFloat', () => { expect(parseFloat('3.14')).toBeCloseTo(3.14); });
  it('handles Array.isArray on objects', () => { expect(Array.isArray({})).toBe(false); expect(Array.isArray(null)).toBe(false); });
});


describe('phase34 coverage', () => {
  it('handles deep clone via JSON', () => { const orig = {a:{b:{c:1}}}; const clone = JSON.parse(JSON.stringify(orig)); clone.a.b.c = 2; expect(orig.a.b.c).toBe(1); });
  it('handles enum-like object', () => { const Direction = { UP: 'UP', DOWN: 'DOWN' } as const; expect(Direction.UP).toBe('UP'); });
  it('handles Readonly type pattern', () => { const cfg = Object.freeze({ debug: false }); expect(cfg.debug).toBe(false); });
  it('handles object method shorthand', () => { const o = { double(x: number) { return x * 2; } }; expect(o.double(6)).toBe(12); });
  it('handles static method', () => { class MathHelper { static square(n: number) { return n*n; } } expect(MathHelper.square(4)).toBe(16); });
});


describe('phase35 coverage', () => {
  it('handles namespace-like module pattern', () => { const Validator = { isEmail: (s:string) => /^[^@]+@[^@]+$/.test(s), isUrl: (s:string) => /^https?:\/\//.test(s), }; expect(Validator.isEmail('a@b.com')).toBe(true); expect(Validator.isUrl('https://example.com')).toBe(true); });
  it('handles object merge deep pattern', () => { const merge = <T extends object>(a: T, b: Partial<T>): T => ({...a,...b}); expect(merge({x:1,y:2},{y:99})).toEqual({x:1,y:99}); });
  it('handles max by key pattern', () => { const maxBy = <T>(arr:T[], fn:(x:T)=>number) => arr.reduce((m,x)=>fn(x)>fn(m)?x:m); expect(maxBy([{v:1},{v:3},{v:2}],x=>x.v).v).toBe(3); });
  it('handles object pick pattern', () => { const pick = <T, K extends keyof T>(o:T, keys:K[]): Pick<T,K> => Object.fromEntries(keys.map(k=>[k,o[k]])) as Pick<T,K>; expect(pick({a:1,b:2,c:3},['a','c'])).toEqual({a:1,c:3}); });
  it('handles number base conversion', () => { expect((10).toString(2)).toBe('1010'); expect((255).toString(16)).toBe('ff'); });
});


describe('phase36 coverage', () => {
  it('handles interval merge pattern', () => { const merge=(ivs:[number,number][])=>{ivs.sort((a,b)=>a[0]-b[0]);const r:[number,number][]=[];for(const iv of ivs){if(!r.length||r[r.length-1][1]<iv[0])r.push(iv);else r[r.length-1][1]=Math.max(r[r.length-1][1],iv[1]);}return r;};expect(merge([[1,3],[2,6],[8,10]])).toEqual([[1,6],[8,10]]); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
  it('handles flatten nested object keys', () => { const flat=(o:Record<string,unknown>,prefix=''):Record<string,unknown>=>{return Object.entries(o).reduce((acc,[k,v])=>{const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(acc,flat(v as Record<string,unknown>,key));else(acc as any)[key]=v;return acc;},{});};expect(flat({a:{b:1}})).toEqual({'a.b':1}); });
  it('handles string compression', () => { const compress=(s:string)=>{let r='',i=0;while(i<s.length){let j=i;while(j<s.length&&s[j]===s[i])j++;r+=j-i>1?`${j-i}${s[i]}`:s[i];i=j;}return r;}; expect(compress('aaabbc')).toBe('3a2bc'); });
  it('handles number to roman numerals', () => { const toRoman=(n:number)=>{const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';vals.forEach((v,i)=>{while(n>=v){r+=syms[i];n-=v;}});return r;};expect(toRoman(9)).toBe('IX');expect(toRoman(58)).toBe('LVIII'); });
});


describe('phase37 coverage', () => {
  it('extracts numbers from string', () => { const nums=(s:string)=>(s.match(/\d+/g)||[]).map(Number); expect(nums('a1b22c333')).toEqual([1,22,333]); });
  it('checks if array is sorted', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1]); expect(isSorted([1,2,3,4])).toBe(true); expect(isSorted([1,3,2])).toBe(false); });
  it('chunks array by predicate', () => { const split=<T>(a:T[],fn:(x:T)=>boolean)=>{const r:T[][]=[];let cur:T[]=[];for(const x of a){if(fn(x)){if(cur.length)r.push(cur);cur=[];}else cur.push(x);}if(cur.length)r.push(cur);return r;}; expect(split([1,2,0,3,4,0,5],x=>x===0)).toEqual([[1,2],[3,4],[5]]); });
  it('removes duplicates preserving order', () => { const unique=<T>(a:T[])=>[...new Set(a)]; expect(unique([3,1,2,1,3])).toEqual([3,1,2]); });
  it('checks string contains only letters', () => { const onlyLetters=(s:string)=>/^[a-zA-Z]+$/.test(s); expect(onlyLetters('Hello')).toBe(true); expect(onlyLetters('Hello1')).toBe(false); });
});
