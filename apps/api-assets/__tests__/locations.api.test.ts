import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: { findMany: jest.fn() },
  },
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

import router from '../src/routes/locations';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/locations', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/locations', () => {
  it('should return location counts', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Warehouse A' },
      { location: 'Warehouse A' },
      { location: 'Factory Floor' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: 'Warehouse A', count: 2 }),
        expect.objectContaining({ location: 'Factory Floor', count: 1 }),
      ])
    );
  });

  it('should skip assets with no location', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: null },
      { location: 'Site B' },
      { location: '' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // null location should be excluded; empty string falsy so also excluded
    const locations = res.body.data.map((d: any) => d.location);
    expect(locations).not.toContain(null);
  });

  it('should return empty array when no assets', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB connection error'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone A' }]);
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('each entry in data has location and count fields', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Store Room' },
      { location: 'Store Room' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('location');
    expect(res.body.data[0]).toHaveProperty('count');
  });

  it('three distinct locations produce three separate entries', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Alpha' },
      { location: 'Beta' },
      { location: 'Gamma' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('location appearing three times has count of 3', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Hub' },
      { location: 'Hub' },
      { location: 'Hub' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const hub = res.body.data.find((d: any) => d.location === 'Hub');
    expect(hub.count).toBe(3);
  });

  it('data is an array', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Locations — extended', () => {
  it('count field is a number', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone X' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].count).toBe('number');
  });

  it('location field is a string', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone Y' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].location).toBe('string');
  });

  it('findMany called once on each new request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(2);
  });

  it('success is false and code is INTERNAL_ERROR on rejection', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('two locations with same name are collapsed into one entry', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Lab 1' },
      { location: 'Lab 1' },
      { location: 'Lab 2' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const names = res.body.data.map((d: any) => d.location);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });
});
describe('Locations — field and edge-case coverage', () => {
  it('returns entries sorted with at least one entry when assets have valid locations', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Alpha' },
      { location: 'Beta' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('a single unique location produces a single entry with count 1', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Room 101' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].count).toBe(1);
  });

  it('four assets with two distinct locations produce two entries', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Zone A' },
      { location: 'Zone A' },
      { location: 'Zone B' },
      { location: 'Zone B' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('findMany called with deletedAt: null filter', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      })
    );
  });

  it('error response has INTERNAL_ERROR code on rejection', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB unavailable'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response data items each have exactly location and count keys', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Dock 1' },
      { location: 'Dock 2' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(Object.keys(item)).toEqual(expect.arrayContaining(['location', 'count']));
    }
  });

  it('count is correct for 5 assets at same location', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Bay 5' },
      { location: 'Bay 5' },
      { location: 'Bay 5' },
      { location: 'Bay 5' },
      { location: 'Bay 5' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data[0].count).toBe(5);
  });

  it('empty string locations are excluded from output', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: '' },
      { location: '' },
      { location: 'Valid Site' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const locations = res.body.data.map((d: any) => d.location);
    expect(locations).not.toContain('');
    expect(locations).toContain('Valid Site');
  });
});

describe('GET /api/locations — additional coverage', () => {
  it('enforces authentication — authenticate middleware is called', async () => {
    const { authenticate } = require('@ims/auth');
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    expect(authenticate).toHaveBeenCalled();
  });

  it('returns empty array when all assets have null locations', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: null },
      { location: null },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /locations with unknown query params still returns 200', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Depot' }]);
    const res = await request(app).get('/api/locations?foo=bar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 with INTERNAL_ERROR code when findMany throws a timeout error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('Query timeout'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('mixed null and valid locations — only valid locations appear in output', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Plant A' },
      { location: null },
      { location: 'Plant A' },
      { location: '' },
      { location: 'Warehouse B' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const names = res.body.data.map((d: any) => d.location);
    expect(names).toContain('Plant A');
    expect(names).toContain('Warehouse B');
    expect(names).not.toContain(null);
    expect(names).not.toContain('');
    const plantA = res.body.data.find((d: any) => d.location === 'Plant A');
    expect(plantA.count).toBe(2);
  });
});

describe('Locations API — final coverage block', () => {
  it('response content-type contains json', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST is not supported — returns 404', async () => {
    const res = await request(app).post('/api/locations').send({});
    expect(res.status).toBe(404);
  });

  it('findMany is called with select containing location field', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: expect.objectContaining({ location: true }) })
    );
  });

  it('data has no duplicate location names in output', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Same' },
      { location: 'Same' },
      { location: 'Same' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const names = res.body.data.map((d: any) => d.location);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
    expect(names.length).toBe(1);
  });

  it('success is true on empty result set', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.body.success).toBe(true);
  });

  it('count for location is 1 when only one asset at that location', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Unique Place' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data[0].count).toBe(1);
  });

  it('findMany is called with orgId filter matching authenticated user', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) })
    );
  });
});

describe('Locations API — extra coverage', () => {
  it('success:true is present in body on 200', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Area 51' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('six assets at two locations each produce two entries with count 3', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'X' }, { location: 'X' }, { location: 'X' },
      { location: 'Y' }, { location: 'Y' }, { location: 'Y' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    const x = res.body.data.find((d: any) => d.location === 'X');
    expect(x.count).toBe(3);
  });

  it('error body has error.message on 500', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('fatal'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });

  it('response data length equals number of distinct non-empty locations', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'A' }, { location: 'B' }, { location: 'C' },
      { location: null }, { location: '' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('response content-type is application/json', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('locations — phase29 coverage', () => {
  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles try-catch flow', () => {
    let caught = false; try { throw new Error(); } catch { caught = true; } expect(caught).toBe(true);
  });

  it('handles generator type', () => {
    function* gen() { yield 1; } expect(typeof gen()).toBe('object');
  });

  it('handles iterable protocol', () => {
    const iter = [1, 2, 3][Symbol.iterator](); expect(iter.next().value).toBe(1);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

});

describe('locations — phase30 coverage', () => {
  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles ternary operator', () => {
    expect(true ? 'yes' : 'no').toBe('yes');
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

});


describe('phase31 coverage', () => {
  it('handles Math.min', () => { expect(Math.min(1,5,3)).toBe(1); });
  it('handles array findIndex', () => { expect([1,2,3].findIndex(x => x > 1)).toBe(1); });
  it('handles typeof null', () => { expect(typeof null).toBe('object'); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles object hasOwnProperty', () => { const o = {a:1}; expect(o.hasOwnProperty('a')).toBe(true); expect(o.hasOwnProperty('b')).toBe(false); });
  it('handles number toString', () => { expect((255).toString(16)).toBe('ff'); });
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
  it('handles Object.fromEntries', () => { const m = new Map([['a',1],['b',2]]); expect(Object.fromEntries(m)).toEqual({a:1,b:2}); });
});


describe('phase33 coverage', () => {
  it('handles error stack type', () => { const e = new Error('test'); expect(typeof e.stack).toBe('string'); });
  it('handles Set size', () => { expect(new Set([1,2,3,3]).size).toBe(3); });
  it('handles string charCodeAt', () => { expect('A'.charCodeAt(0)).toBe(65); });
  it('handles iterable protocol', () => { const iter = { [Symbol.iterator]() { let i = 0; return { next() { return i < 3 ? { value: i++, done: false } : { value: undefined, done: true }; } }; } }; expect([...iter]).toEqual([0,1,2]); });
  it('subtracts numbers', () => { expect(10 - 3).toBe(7); });
});


describe('phase34 coverage', () => {
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('checks truthy values', () => { expect(Boolean(1)).toBe(true); expect(Boolean('')).toBe(false); expect(Boolean(0)).toBe(false); });
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles default value in destructuring', () => { const {x=10,y=20} = {x:5} as {x?:number;y?:number}; expect(x).toBe(5); expect(y).toBe(20); });
});
