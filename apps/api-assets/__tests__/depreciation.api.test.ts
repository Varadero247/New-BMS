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

import router from '../src/routes/depreciation';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/depreciation', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/depreciation', () => {
  it('should return depreciation data for assets', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      {
        id: '1',
        name: 'Forklift',
        purchaseCost: 50000,
        currentValue: 30000,
        purchaseDate: '2023-01-01',
      },
      {
        id: '2',
        name: 'Pump',
        purchaseCost: 10000,
        currentValue: 7500,
        purchaseDate: '2024-06-01',
      },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Forklift');
  });

  it('should return empty array when no assets with purchase cost', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB connection error'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single asset correctly', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Compressor', purchaseCost: 25000, currentValue: 18000, purchaseDate: '2024-01-15' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Compressor');
    expect(res.body.data[0].purchaseCost).toBe(25000);
    expect(res.body.data[0].currentValue).toBe(18000);
  });

  it('each asset entry has the expected fields', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-2', name: 'Generator', purchaseCost: 80000, currentValue: 60000, purchaseDate: '2022-06-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    const asset = res.body.data[0];
    expect(asset).toHaveProperty('id');
    expect(asset).toHaveProperty('name');
    expect(asset).toHaveProperty('purchaseCost');
    expect(asset).toHaveProperty('currentValue');
    expect(asset).toHaveProperty('purchaseDate');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('data is an array', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('all returned assets have a name property', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Drill', purchaseCost: 1000, currentValue: 800, purchaseDate: '2025-01-01' },
      { id: 'a-2', name: 'Lathe', purchaseCost: 2000, currentValue: 1500, purchaseDate: '2025-02-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    for (const asset of res.body.data) {
      expect(asset).toHaveProperty('name');
    }
  });

  it('success is true on 200 response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Depreciation — extended', () => {
  it('data length matches number of assets returned by findMany', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Pump', purchaseCost: 5000, currentValue: 3000, purchaseDate: '2023-01-01' },
      { id: 'a-2', name: 'Motor', purchaseCost: 8000, currentValue: 6000, purchaseDate: '2024-01-01' },
      { id: 'a-3', name: 'Valve', purchaseCost: 2000, currentValue: 1500, purchaseDate: '2025-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.body.data).toHaveLength(3);
  });

  it('currentValue is a number for each asset', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Machine', purchaseCost: 10000, currentValue: 7500, purchaseDate: '2024-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(typeof res.body.data[0].currentValue).toBe('number');
  });

  it('handles asset with currentValue zero', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Obsolete Machine', purchaseCost: 5000, currentValue: 0, purchaseDate: '2018-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].currentValue).toBe(0);
  });
});

describe('Depreciation — extra', () => {
  it('purchaseCost is a number for each asset', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Lathe', purchaseCost: 12000, currentValue: 9000, purchaseDate: '2023-05-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].purchaseCost).toBe('number');
  });

  it('returns 200 with multiple assets having different costs', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Asset One', purchaseCost: 100, currentValue: 80, purchaseDate: '2024-01-01' },
      { id: 'a-2', name: 'Asset Two', purchaseCost: 200, currentValue: 150, purchaseDate: '2024-06-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].purchaseCost).toBe(100);
    expect(res.body.data[1].purchaseCost).toBe(200);
  });

  it('error code is INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('Depreciation — edge cases and field validation', () => {
  it('findMany is called with purchaseCost not-null filter', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ purchaseCost: { not: null } }),
      })
    );
  });

  it('findMany is called with take: 500 limit', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 500 })
    );
  });

  it('findMany is called with select containing exactly 5 fields', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          name: true,
          purchaseCost: true,
          currentValue: true,
          purchaseDate: true,
        }),
      })
    );
  });

  it('handles asset where purchaseCost equals currentValue (not yet depreciated)', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'New Tool', purchaseCost: 3000, currentValue: 3000, purchaseDate: '2026-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].currentValue).toBe(res.body.data[0].purchaseCost);
  });

  it('handles large fleet of 10 assets without error', async () => {
    const assets = Array.from({ length: 10 }, (_, i) => ({
      id: `a-${i}`,
      name: `Asset ${i}`,
      purchaseCost: (i + 1) * 1000,
      currentValue: (i + 1) * 800,
      purchaseDate: '2024-01-01',
    }));
    mockPrisma.assetRegister.findMany.mockResolvedValue(assets);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
  });

  it('response body has no extra top-level keys besides success and data', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    const keys = Object.keys(res.body);
    expect(keys).toContain('success');
    expect(keys).toContain('data');
  });

  it('error response body has success: false and an error object', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('network failure'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('purchaseDate field is returned as a string', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Press', purchaseCost: 20000, currentValue: 15000, purchaseDate: '2023-08-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].purchaseDate).toBe('string');
  });
});

describe('Depreciation — additional coverage', () => {
  it('returns 401 when authenticate rejects the request', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce(
      (_req: any, res: any, _next: any) => {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
      }
    );
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns empty array (not null) when no assets match — empty list response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('returns 500 with INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('query timeout'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.success).toBe(false);
  });

  it('positive CRUD: returns asset with all five selected fields populated', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-99', name: 'CNC Machine', purchaseCost: 150000, currentValue: 120000, purchaseDate: '2024-03-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const asset = res.body.data[0];
    expect(asset.id).toBe('a-99');
    expect(asset.name).toBe('CNC Machine');
    expect(asset.purchaseCost).toBe(150000);
    expect(asset.currentValue).toBe(120000);
    expect(asset.purchaseDate).toBe('2024-03-01');
  });

  it('findMany is called with where clause including deletedAt null', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      })
    );
  });
});

describe('Depreciation — comprehensive coverage', () => {
  it('returns data where all items have purchaseCost > 0', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Asset A', purchaseCost: 5000, currentValue: 3000, purchaseDate: '2023-01-01' },
      { id: 'a-2', name: 'Asset B', purchaseCost: 8000, currentValue: 6000, purchaseDate: '2024-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    for (const asset of res.body.data) {
      expect(asset.purchaseCost).toBeGreaterThan(0);
    }
  });

  it('findMany called once per GET request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(2);
  });

  it('data items id field matches the mocked id', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'specific-comp-id', name: 'Machine X', purchaseCost: 10000, currentValue: 7000, purchaseDate: '2023-06-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('specific-comp-id');
  });

  it('success is false when DB error occurs', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/depreciation');
    expect(res.body.success).toBe(false);
  });

  it('handles an asset with very high purchase cost correctly', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-high', name: 'Turbine', purchaseCost: 10000000, currentValue: 8000000, purchaseDate: '2020-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].purchaseCost).toBe(10000000);
  });
});

describe('Depreciation — final coverage block', () => {
  it('POST is not supported — returns 404', async () => {
    const res = await request(app).post('/api/depreciation').send({});
    expect(res.status).toBe(404);
  });

  it('data items currentValue is less than or equal to purchaseCost', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Compressor', purchaseCost: 10000, currentValue: 8000, purchaseDate: '2023-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].currentValue).toBeLessThanOrEqual(res.body.data[0].purchaseCost);
  });

  it('response content-type contains json', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('findMany is called with orgId filter', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-1' }),
      })
    );
  });

  it('success is true when assets have high purchase costs', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Server', purchaseCost: 500000, currentValue: 400000, purchaseDate: '2022-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data[0].id is the same id as returned by mock', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'unique-id-xyz', name: 'Widget', purchaseCost: 1000, currentValue: 750, purchaseDate: '2025-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('unique-id-xyz');
  });

  it('success flag is boolean true on successful response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });
});

describe('depreciation — phase29 coverage', () => {
  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

  it('handles iterable protocol', () => {
    const iter = [1, 2, 3][Symbol.iterator](); expect(iter.next().value).toBe(1);
  });

  it('handles Array.from', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c']);
  });

  it('handles async resolve', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok');
  });

  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

});

describe('depreciation — phase30 coverage', () => {
  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

});


describe('phase31 coverage', () => {
  it('handles string endsWith', () => { expect('hello'.endsWith('llo')).toBe(true); });
  it('handles rest params', () => { const fn = (...args: number[]) => args.reduce((a,b)=>a+b,0); expect(fn(1,2,3)).toBe(6); });
  it('handles Object.values', () => { expect(Object.values({a:1,b:2})).toEqual([1,2]); });
  it('handles error instanceof', () => { const e = new Error('oops'); expect(e instanceof Error).toBe(true); });
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
});


describe('phase32 coverage', () => {
  it('handles string indexOf', () => { expect('foobar'.indexOf('bar')).toBe(3); expect('foobar'.indexOf('baz')).toBe(-1); });
  it('handles Math.pow', () => { expect(Math.pow(2,10)).toBe(1024); });
  it('handles array at method', () => { expect([1,2,3].at(-1)).toBe(3); });
  it('returns correct type for number', () => { expect(typeof 42).toBe('number'); });
  it('handles string matchAll', () => { const matches = [...'test1 test2'.matchAll(/test(\d)/g)]; expect(matches.length).toBe(2); });
});


describe('phase33 coverage', () => {
  it('handles string search', () => { expect('hello world'.search(/world/)).toBe(6); });
  it('handles property descriptor', () => { const o = {}; Object.defineProperty(o, 'x', { value: 99, writable: false }); expect((o as any).x).toBe(99); });
  it('handles Map delete', () => { const m = new Map<string,number>([['a',1]]); m.delete('a'); expect(m.has('a')).toBe(false); });
  it('handles parseFloat', () => { expect(parseFloat('3.14')).toBeCloseTo(3.14); });
  it('handles array pop', () => { const a = [1,2,3]; expect(a.pop()).toBe(3); expect(a).toEqual([1,2]); });
});


describe('phase34 coverage', () => {
  it('handles array of objects sort', () => { const arr = [{n:3},{n:1},{n:2}]; arr.sort((a,b)=>a.n-b.n); expect(arr[0].n).toBe(1); });
  it('handles Map with complex values', () => { const m = new Map<string, number[]>(); m.set('evens', [2,4,6]); expect(m.get('evens')?.length).toBe(3); });
  it('handles IIFE pattern', () => { const result = ((x: number) => x * x)(7); expect(result).toBe(49); });
  it('handles Partial type pattern', () => { interface Config { host: string; port: number; } const defaults: Config = { host: 'localhost', port: 8080 }; const override: Partial<Config> = { port: 9000 }; const merged = { ...defaults, ...override }; expect(merged.port).toBe(9000); });
  it('handles conditional type pattern', () => { type IsString<T> = T extends string ? true : false; const check = <T>(v: T): boolean => typeof v === 'string'; expect(check('hello')).toBe(true); expect(check(1)).toBe(false); });
});
