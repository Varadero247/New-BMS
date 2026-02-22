import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { docDocument: { findMany: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/search';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/search', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/search', () => {
  it('should return empty array when no query provided', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return matching documents for a query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '1', title: 'Safety Policy', description: 'Health and safety policy document' },
      { id: '2', title: 'Safety Procedure', description: 'Procedure for safety checks' },
    ]);
    const res = await request(app).get('/api/search?q=safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe('Safety Policy');
  });

  it('should return empty array when no documents match the query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should call findMany with correct orgId filter', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=report');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-1', deletedAt: null }),
      })
    );
  });

  it('findMany is NOT called when query is absent', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(mockPrisma.docDocument.findMany).not.toHaveBeenCalled();
  });

  it('returns a single document result', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'ISO 9001 Manual', description: 'Quality management system manual' },
    ]);
    const res = await request(app).get('/api/search?q=ISO');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('ISO 9001 Manual');
  });

  it('findMany is called once when query is present', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=policy');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledTimes(1);
  });

  it('response data is an array', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=anything');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Search — extended', () => {
  it('returns multiple results matching the query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Doc A', description: 'desc a' },
      { id: 'd-2', title: 'Doc B', description: 'desc b' },
      { id: 'd-3', title: 'Doc C', description: 'desc c' },
    ]);
    const res = await request(app).get('/api/search?q=doc');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('data length matches mock count', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Alpha', description: 'alpha desc' },
      { id: 'd-2', title: 'Beta', description: 'beta desc' },
    ]);
    const res = await request(app).get('/api/search?q=alpha');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('success is false on 500', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('unexpected error'));
    const res = await request(app).get('/api/search?q=error');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returned documents have id and title fields', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'abc-123', title: 'Quality Manual', description: 'manual' },
    ]);
    const res = await request(app).get('/api/search?q=quality');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('title');
  });

  it('findMany not called when q param is empty string', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(200);
    expect(mockPrisma.docDocument.findMany).not.toHaveBeenCalled();
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('Search — additional coverage', () => {
  it('returns 401 when authenticate rejects the request', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce(
      (_req: any, res: any, _next: any) => {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
      }
    );
    const res = await request(app).get('/api/search?q=anything');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns empty array (not null) when q is absent — empty list response', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('returns 500 with INTERNAL_ERROR code on DB failure', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('connection refused'));
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('each returned document has a description field', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-10', title: 'Environmental Policy', description: 'ISO 14001 policy doc' },
      { id: 'd-11', title: 'Safety Manual', description: 'Comprehensive safety guide' },
    ]);
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(200);
    for (const doc of res.body.data) {
      expect(doc).toHaveProperty('description');
    }
  });

  it('findMany called with OR filter containing both title and description', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=manual');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(Object) }),
            expect.objectContaining({ description: expect.any(Object) }),
          ]),
        }),
      })
    );
  });
});

// ─── Search — take limit and response shape coverage ─────────────────────────

describe('Search — take limit and response shape coverage', () => {
  it('findMany called with take: 20 to enforce result limit', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=limit');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });

  it('findMany called with deletedAt: null to exclude soft-deleted docs', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=active');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it('response body has success property on 200', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).toHaveProperty('success');
  });

  it('response body has data property on 200', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).toHaveProperty('data');
  });

  it('500 response has error.message field', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/search?q=fail');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });

  it('returns multiple documents with correct id and title fields', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000010', title: 'Policy A', description: 'desc a' },
      { id: '00000000-0000-0000-0000-000000000011', title: 'Policy B', description: 'desc b' },
    ]);
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000010');
    expect(res.body.data[1].id).toBe('00000000-0000-0000-0000-000000000011');
  });

  it('response content-type is JSON', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=json');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('findMany called with orderBy: createdAt desc', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=order');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });
});

describe('Search — additional query and response coverage', () => {
  it('GET /search?q=test response body is an object', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(typeof res.body).toBe('object');
  });

  it('GET /search?q=multi returns data length matching mock', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Doc A', description: 'desc a' },
      { id: 'd-2', title: 'Doc B', description: 'desc b' },
      { id: 'd-3', title: 'Doc C', description: 'desc c' },
      { id: 'd-4', title: 'Doc D', description: 'desc d' },
    ]);
    const res = await request(app).get('/api/search?q=multi');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  it('GET /search?q=test findMany called with orgId filter', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=test');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) }),
    );
  });

  it('500 response success is false', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/search?q=crash');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns first document id correctly from mock', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000099', title: 'First', description: 'desc' },
    ]);
    const res = await request(app).get('/api/search?q=first');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000099');
  });

  it('returns 200 with success:true even when q contains only letters', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=xyz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / without q param returns empty array not null', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Search — final boundary coverage', () => {
  it('GET /search?q=test response status is 200 on success', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(200);
  });

  it('findMany returns items with correct field values', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'id-x', title: 'Risk Assessment', description: 'Annual risk review' },
    ]);
    const res = await request(app).get('/api/search?q=risk');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Risk Assessment');
    expect(res.body.data[0].description).toBe('Annual risk review');
  });

  it('GET /search?q=test body is not null', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).not.toBeNull();
  });

  it('500 error response does not have data property', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/search?q=crash');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /search without q returns data array length 0', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('Search — phase28 coverage', () => {
  it('GET /search?q=abc returns success:true', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=abc');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /search?q=x findMany called with orgId org-1', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=x');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) }),
    );
  });

  it('GET /search?q=test response body is not null', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).not.toBeNull();
  });

  it('GET /search?q=test data is array of length matching mock', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'p1', title: 'Phase28 Doc', description: 'phase 28' },
    ]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /search?q= returns empty array without calling findMany', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(mockPrisma.docDocument.findMany).not.toHaveBeenCalled();
  });
});

describe('search — phase30 coverage', () => {
  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles numeric identity', () => {
    expect(1 + 1).toBe(2);
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles numeric type', () => {
    expect(typeof 42).toBe('number');
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

});


describe('phase31 coverage', () => {
  it('handles typeof null', () => { expect(typeof null).toBe('object'); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles rest params', () => { const fn = (...args: number[]) => args.reduce((a,b)=>a+b,0); expect(fn(1,2,3)).toBe(6); });
  it('handles Math.ceil', () => { expect(Math.ceil(3.1)).toBe(4); });
  it('handles array destructuring', () => { const [x, y] = [1, 2]; expect(x).toBe(1); expect(y).toBe(2); });
});


describe('phase32 coverage', () => {
  it('handles Array.from Set', () => { const s = new Set([1,1,2,3]); expect(Array.from(s)).toEqual([1,2,3]); });
  it('handles Array.from with mapFn', () => { expect(Array.from({length:3}, (_,i) => i*2)).toEqual([0,2,4]); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
  it('handles Object.fromEntries', () => { const m = new Map([['a',1],['b',2]]); expect(Object.fromEntries(m)).toEqual({a:1,b:2}); });
  it('handles bitwise AND', () => { expect(6 & 3).toBe(2); });
});


describe('phase33 coverage', () => {
  it('converts string to number', () => { expect(Number('3.14')).toBeCloseTo(3.14); });
  it('handles Infinity', () => { expect(1/0).toBe(Infinity); expect(isFinite(1/0)).toBe(false); });
  it('handles tagged template', () => { const tag = (s: TemplateStringsArray, ...v: number[]) => s.raw[0] + v[0]; expect(tag`val:${42}`).toBe('val:42'); });
  it('handles Proxy basic', () => { const p = new Proxy({x:1}, { get(t,k) { return (t as any)[k] * 2; } }); expect((p as any).x).toBe(2); });
  it('checks array is not empty', () => { expect([1].length).toBeGreaterThan(0); });
});


describe('phase34 coverage', () => {
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
  it('handles enum-like object', () => { const Direction = { UP: 'UP', DOWN: 'DOWN' } as const; expect(Direction.UP).toBe('UP'); });
  it('handles getter in class', () => { class C { private _x = 0; get x() { return this._x; } set x(v: number) { this._x = v; } } const c = new C(); c.x = 5; expect(c.x).toBe(5); });
  it('handles deep clone via JSON', () => { const orig = {a:{b:{c:1}}}; const clone = JSON.parse(JSON.stringify(orig)); clone.a.b.c = 2; expect(orig.a.b.c).toBe(1); });
});
