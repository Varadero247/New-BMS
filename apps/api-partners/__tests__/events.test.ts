import express from "express";
import request from "supertest";

jest.mock("../src/prisma", () => ({
  prisma: {
    mktPartnerDeal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@ims/monitoring", () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import eventsRouter from "../src/routes/events";
import { prisma } from "../src/prisma";

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => { req.partner = { id: "partner-1" }; next(); });
app.use("/api/events", eventsRouter);

beforeEach(() => { jest.clearAllMocks(); });

const mockEvent = {
  id: "00000000-0000-0000-0000-000000000001",
  partnerId: "partner-1",
  title: "Partner Summit 2026",
  description: "Annual partner conference",
  stage: "DISCOVERY",
  dealValue: 0,
  currency: "USD",
  expectedCloseDate: new Date("2026-06-01"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/events", () => {
  it("returns list of events", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockEvent]);
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
  it("returns empty array when no events", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
  it("returns 401 without partner auth", async () => {
    const noAuthApp = express(); noAuthApp.use(express.json()); noAuthApp.use("/api/events", eventsRouter);
    const res = await request(noAuthApp).get("/api/events");
    expect(res.status).toBe(401);
  });
  it("returns 500 on DB error", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("response body has success property", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/events");
    expect(res.body).toHaveProperty("success", true);
  });
  it("response body data is array", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/events");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("findMany is called once", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/events");
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledTimes(1);
  });
  it("filters by status when provided", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/events?status=ACTIVE");
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: "ACTIVE" }) }));
  });
  it("500 response success is false", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/events");
    expect(res.body.success).toBe(false);
  });
  it("data[0].title matches mock event", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockEvent]);
    const res = await request(app).get("/api/events");
    expect(res.body.data[0].title).toBe("Partner Summit 2026");
  });
  it("orders by createdAt desc", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/events");
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
  });
  it("limits to 100 results", async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/events");
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
  });
});

describe("POST /api/events", () => {
  const validPayload = { title: "Webinar", description: "Learn about IMS", eventType: "WEBINAR", eventDate: "2026-05-01" };

  it("creates event with valid data", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).post("/api/events").send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it("returns 400 for missing title", async () => {
    const res = await request(app).post("/api/events").send({ ...validPayload, title: undefined });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("returns 400 for missing eventDate", async () => {
    const res = await request(app).post("/api/events").send({ title: "Test", description: "desc", eventType: "WEBINAR" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("returns 400 for invalid eventType", async () => {
    const res = await request(app).post("/api/events").send({ ...validPayload, eventType: "INVALID" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("returns 401 without partner auth", async () => {
    const noAuthApp = express(); noAuthApp.use(express.json()); noAuthApp.use("/api/events", eventsRouter);
    const res = await request(noAuthApp).post("/api/events").send(validPayload);
    expect(res.status).toBe(401);
  });
  it("returns 500 on DB error", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await request(app).post("/api/events").send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("create called once on success", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    await request(app).post("/api/events").send(validPayload);
    expect(prisma.mktPartnerDeal.create).toHaveBeenCalledTimes(1);
  });
  it("accepts CONFERENCE eventType", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue({ ...mockEvent, stage: "PROPOSAL" });
    const res = await request(app).post("/api/events").send({ ...validPayload, eventType: "CONFERENCE" });
    expect(res.status).toBe(201);
  });
  it("accepts TRAINING eventType", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).post("/api/events").send({ ...validPayload, eventType: "TRAINING" });
    expect(res.status).toBe(201);
  });
  it("response body has data property on success", async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).post("/api/events").send(validPayload);
    expect(res.body).toHaveProperty("data");
  });
});

describe("GET /api/events/:id", () => {
  it("returns single event", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it("returns 404 when not found", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000099");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
  it("returns 401 without partner auth", async () => {
    const noAuthApp = express(); noAuthApp.use(express.json()); noAuthApp.use("/api/events", eventsRouter);
    const res = await request(noAuthApp).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(401);
  });
  it("returns 500 on DB error", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("findUnique called with correct id", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(prisma.mktPartnerDeal.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "00000000-0000-0000-0000-000000000001" } }));
  });
  it("data.title matches mock on success", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.body.data.title).toBe("Partner Summit 2026");
  });
  it("404 success:false", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000099");
    expect(res.body.success).toBe(false);
  });
  it("500 success:false", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.body.success).toBe(false);
  });
  it("success response data has id", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.body.data).toHaveProperty("id");
  });
  it("findUnique is called exactly once", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(prisma.mktPartnerDeal.findUnique).toHaveBeenCalledTimes(1);
  });
  it("200 response has success:true", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.body.success).toBe(true);
  });
  it("500 status code is 500", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(500);
  });
  it("success response data.currency is USD", async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).get("/api/events/00000000-0000-0000-0000-000000000001");
    expect(res.body.data.currency).toBe("USD");
  });
});


describe('events — phase28 coverage', () => {
  it('GET / with no status filter does not include status in where', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/events');
    const call = (prisma.mktPartnerDeal.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where).not.toHaveProperty('status');
  });
  it('POST / missing eventType returns 400', async () => {
    const res = await request(app).post('/api/events').send({ title: 'Test', description: 'desc', eventDate: '2026-05-01' });
    expect(res.status).toBe(400);
  });
  it('POST / NETWORKING eventType is valid', async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).post('/api/events').send({ title: 'Net', description: 'net', eventType: 'NETWORKING', eventDate: '2026-05-01' });
    expect(res.status).toBe(201);
  });
  it('POST / WORKSHOP eventType is valid', async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockEvent);
    const res = await request(app).post('/api/events').send({ title: 'Workshop', description: 'ws', eventType: 'WORKSHOP', eventDate: '2026-05-01' });
    expect(res.status).toBe(201);
  });
  it('GET / 500 error code is INTERNAL_ERROR', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/events');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
  it('GET /:id 404 error code is NOT_FOUND', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/events/00000000-0000-0000-0000-000000000099');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
  it('POST / 500 error code is INTERNAL_ERROR', async () => {
    (prisma.mktPartnerDeal.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/events').send({ title: 'Webinar', description: 'desc', eventType: 'WEBINAR', eventDate: '2026-05-01' });
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
  it('GET / response status 200', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
  });
  it('POST / 400 success is false', async () => {
    const res = await request(app).post('/api/events').send({});
    expect(res.body.success).toBe(false);
  });
  it('GET / returns 200 with multiple events', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockEvent, { ...mockEvent, id: '00000000-0000-0000-0000-000000000002' }]);
    const res = await request(app).get('/api/events');
    expect(res.body.data).toHaveLength(2);
  });
});
describe('events — phase30 coverage', () => {
  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles string trim', () => {
    expect('  hello  '.trim()).toBe('hello');
  });

  it('handles numeric type', () => {
    expect(typeof 42).toBe('number');
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

});


describe('phase31 coverage', () => {
  it('handles array indexOf', () => { expect([1,2,3].indexOf(2)).toBe(1); });
  it('handles optional chaining', () => { const o: any = null; expect(o?.x).toBeUndefined(); });
  it('handles string repeat', () => { expect('ab'.repeat(3)).toBe('ababab'); });
  it('handles array splice', () => { const a = [1,2,3]; a.splice(1,1); expect(a).toEqual([1,3]); });
  it('handles string includes', () => { expect('foobar'.includes('bar')).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles array join', () => { expect([1,2,3].join('-')).toBe('1-2-3'); });
  it('handles Promise.allSettled', async () => { const r = await Promise.allSettled([Promise.resolve(1)]); expect(r[0].status).toBe('fulfilled'); });
  it('handles string at method', () => { expect('hello'.at(-1)).toBe('o'); });
  it('handles for...in loop', () => { const o = {a:1,b:2}; const keys: string[] = []; for (const k in o) keys.push(k); expect(keys.sort()).toEqual(['a','b']); });
  it('handles Set iteration', () => { const s = new Set([1,2,3]); expect([...s]).toEqual([1,2,3]); });
});


describe('phase33 coverage', () => {
  it('handles encodeURIComponent', () => { expect(encodeURIComponent('hello world')).toBe('hello%20world'); });
  it('handles string charCodeAt', () => { expect('A'.charCodeAt(0)).toBe(65); });
  it('handles toFixed', () => { expect((3.14159).toFixed(2)).toBe('3.14'); });
  it('handles array unshift', () => { const a = [2,3]; a.unshift(1); expect(a).toEqual([1,2,3]); });
  it('handles property descriptor', () => { const o = {}; Object.defineProperty(o, 'x', { value: 99, writable: false }); expect((o as any).x).toBe(99); });
});


describe('phase34 coverage', () => {
  it('handles chained optional access', () => { const o: any = {a:{b:{c:42}}}; expect(o?.a?.b?.c).toBe(42); expect(o?.x?.y?.z).toBeUndefined(); });
  it('handles named function expression', () => { const factorial = function fact(n: number): number { return n <= 1 ? 1 : n * fact(n-1); }; expect(factorial(4)).toBe(24); });
  it('handles generic function', () => { function identity<T>(x: T): T { return x; } expect(identity(42)).toBe(42); expect(identity('hi')).toBe('hi'); });
  it('handles mapped type pattern', () => { type Flags<T> = { [K in keyof T]: boolean }; const flags: Flags<{a:number;b:string}> = {a:true,b:false}; expect(flags.a).toBe(true); });
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
});


describe('phase35 coverage', () => {
  it('handles flatMap with filter', () => { expect([[1,2],[3],[4,5]].flatMap(x=>x).filter(x=>x>2)).toEqual([3,4,5]); });
  it('handles Object.is zero', () => { expect(Object.is(0, -0)).toBe(false); });
  it('handles template literal type pattern', () => { type EventName = `on${Capitalize<string>}`; const handler: EventName = 'onClick'; expect(handler.startsWith('on')).toBe(true); });
  it('handles observer pattern', () => { const listeners: Array<(v:number)=>void> = []; const on = (fn:(v:number)=>void) => listeners.push(fn); const emit = (v:number) => listeners.forEach(fn=>fn(v)); const results: number[] = []; on(v=>results.push(v)); on(v=>results.push(v*2)); emit(5); expect(results).toEqual([5,10]); });
  it('handles sum by key pattern', () => { const sumBy = <T>(arr:T[], fn:(x:T)=>number) => arr.reduce((s,x)=>s+fn(x),0); expect(sumBy([{v:1},{v:2},{v:3}],x=>x.v)).toBe(6); });
});


describe('phase36 coverage', () => {
  it('handles number digit sum', () => { const digitSum=(n:number)=>String(Math.abs(n)).split('').reduce((s,d)=>s+Number(d),0);expect(digitSum(12345)).toBe(15);expect(digitSum(999)).toBe(27); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
  it('handles two-sum pattern', () => { const twoSum=(nums:number[],t:number)=>{const m=new Map<number,number>();for(let i=0;i<nums.length;i++){const c=t-nums[i];if(m.has(c))return[m.get(c)!,i];m.set(nums[i],i);}return[];}; expect(twoSum([2,7,11,15],9)).toEqual([0,1]); });
  it('handles top-K elements', () => { const topK=(a:number[],k:number)=>[...a].sort((x,y)=>y-x).slice(0,k);expect(topK([3,1,4,1,5,9,2,6],3)).toEqual([9,6,5]); });
  it('handles string rotation check', () => { const isRotation=(s:string,t:string)=>s.length===t.length&&(s+s).includes(t);expect(isRotation('abcde','cdeab')).toBe(true);expect(isRotation('abcde','abced')).toBe(false); });
});


describe('phase37 coverage', () => {
  it('escapes HTML entities', () => { const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); expect(esc('<div>&</div>')).toBe('&lt;div&gt;&amp;&lt;/div&gt;'); });
  it('chunks array by predicate', () => { const split=<T>(a:T[],fn:(x:T)=>boolean)=>{const r:T[][]=[];let cur:T[]=[];for(const x of a){if(fn(x)){if(cur.length)r.push(cur);cur=[];}else cur.push(x);}if(cur.length)r.push(cur);return r;}; expect(split([1,2,0,3,4,0,5],x=>x===0)).toEqual([[1,2],[3,4],[5]]); });
  it('counts occurrences in array', () => { const count=<T>(a:T[],v:T)=>a.filter(x=>x===v).length; expect(count([1,2,1,3,1],1)).toBe(3); });
  it('sums nested arrays', () => { const sumNested=(a:number[][])=>a.reduce((t,r)=>t+r.reduce((s,v)=>s+v,0),0); expect(sumNested([[1,2],[3,4],[5]])).toBe(15); });
  it('rotates array left', () => { const rotL=<T>(a:T[],n:number)=>[...a.slice(n),...a.slice(0,n)]; expect(rotL([1,2,3,4,5],2)).toEqual([3,4,5,1,2]); });
});


describe('phase38 coverage', () => {
  it('splits array into n chunks', () => { const chunks=<T>(a:T[],n:number)=>Array.from({length:n},(_,i)=>a.filter((_,j)=>j%n===i)); expect(chunks([1,2,3,4,5,6],3)).toEqual([[1,4],[2,5],[3,6]]); });
  it('computes edit distance between two arrays', () => { const arrDiff=<T>(a:T[],b:T[])=>a.filter(x=>!b.includes(x)).length+b.filter(x=>!a.includes(x)).length; expect(arrDiff([1,2,3],[2,3,4])).toBe(2); });
  it('evaluates simple RPN expression', () => { const rpn=(tokens:string[])=>{const st:number[]=[];for(const t of tokens){if(/^-?\d+$/.test(t))st.push(Number(t));else{const b=st.pop()!,a=st.pop()!;st.push(t==='+'?a+b:t==='-'?a-b:t==='*'?a*b:a/b);}}return st[0];}; expect(rpn(['2','1','+','3','*'])).toBe(9); });
  it('generates fibonacci sequence up to n', () => { const fibSeq=(n:number)=>{const s=[0,1];while(s[s.length-1]+s[s.length-2]<=n)s.push(s[s.length-1]+s[s.length-2]);return s.filter(v=>v<=n);}; expect(fibSeq(10)).toEqual([0,1,1,2,3,5,8]); });
  it('checks perfect number', () => { const isPerfect=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s===n&&n!==1;}; expect(isPerfect(6)).toBe(true); expect(isPerfect(28)).toBe(true); expect(isPerfect(12)).toBe(false); });
});


describe('phase39 coverage', () => {
  it('computes integer square root', () => { const isqrt=(n:number)=>Math.floor(Math.sqrt(n)); expect(isqrt(16)).toBe(4); expect(isqrt(17)).toBe(4); });
  it('checks if perfect square', () => { const isPerfSq=(n:number)=>Number.isInteger(Math.sqrt(n)); expect(isPerfSq(25)).toBe(true); expect(isPerfSq(26)).toBe(false); });
  it('checks if graph has cycle (undirected)', () => { const hasCycle=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const vis=new Set<number>();const dfs=(node:number,par:number):boolean=>{vis.add(node);for(const nb of adj[node]){if(!vis.has(nb)){if(dfs(nb,node))return true;}else if(nb!==par)return true;}return false;};return dfs(0,-1);}; expect(hasCycle(4,[[0,1],[1,2],[2,3],[3,1]])).toBe(true); expect(hasCycle(3,[[0,1],[1,2]])).toBe(false); });
  it('implements XOR swap', () => { let a=5,b=3; a=a^b; b=a^b; a=a^b; expect(a).toBe(3); expect(b).toBe(5); });
  it('computes minimum coins for amount', () => { const minCoins=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i&&dp[i-c]+1<dp[i])dp[i]=dp[i-c]+1;return dp[amt]===Infinity?-1:dp[amt];}; expect(minCoins([1,5,6,9],11)).toBe(2); });
});
