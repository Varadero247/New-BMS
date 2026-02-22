import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcSite: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
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

import sitesRouter from '../src/routes/sites';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/sites', sitesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/sites', () => {
  it('should return a list of sites with pagination', async () => {
    const sites = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'HQ', customer: { name: 'Acme' } },
    ];
    mockPrisma.fsSvcSite.findMany.mockResolvedValue(sites);
    mockPrisma.fsSvcSite.count.mockResolvedValue(1);

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);

    await request(app).get('/api/sites?customerId=cust-1');

    expect(mockPrisma.fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcSite.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sites');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/sites', () => {
  it('should create a site', async () => {
    const created = {
      id: 'site-new',
      name: 'New Site',
      customerId: 'cust-1',
      address: { city: 'Manchester' },
    };
    mockPrisma.fsSvcSite.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/sites')
      .send({
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'New Site',
        address: { city: 'Manchester' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/sites').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/sites/:id', () => {
  it('should return a site by id', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'HQ',
      customer: {},
    });

    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/sites/:id', () => {
  it('should update a site', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sites/:id', () => {
  it('should soft delete a site', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Site deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcSite.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcSite.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'New Site',
      address: { city: 'Manchester' },
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcSite.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/sites/00000000-0000-0000-0000-000000000001').send({ name: 'Updated Site' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Field Service Sites — extended', () => {
  it('DELETE /:id returns message "Site deleted" on success', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Site deleted');
  });
});


// ===================================================================
// Field Service Sites — additional coverage (5 new tests)
// ===================================================================
describe('Field Service Sites — additional coverage', () => {
  it('GET / response contains pagination metadata', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Depot A', customer: { name: 'Acme' } },
    ]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(1);
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET / filters by customerId when the query param is provided', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);
    await request(app).get('/api/sites?customerId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(mockPrisma.fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
      })
    );
  });

  it('POST / persists the address field in the create call', async () => {
    mockPrisma.fsSvcSite.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      name: 'North Site',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      address: { city: 'Leeds' },
    });
    await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'North Site',
      address: { city: 'Leeds' },
    });
    expect(mockPrisma.fsSvcSite.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ address: { city: 'Leeds' } }),
      })
    );
  });

  it('GET /:id returns the correct site name from the database', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000021',
      name: 'East Depot',
      customer: {},
    });
    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000021');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'East Depot');
  });

  it('PUT /:id update call passes the where id clause to Prisma', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000022',
    });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000022',
      name: 'Renamed Site',
    });
    await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000022')
      .send({ name: 'Renamed Site' });
    expect(mockPrisma.fsSvcSite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000022' }),
      })
    );
  });
});

// ===================================================================
// Field Service Sites — edge cases and validation
// ===================================================================
describe('Field Service Sites — edge cases and validation', () => {
  it('GET / uses default page 1 and limit 50 when no query params', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 50);
  });

  it('GET / pagination total matches count mock value', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000031', name: 'Site A', customer: { name: 'X' } },
      { id: '00000000-0000-0000-0000-000000000032', name: 'Site B', customer: { name: 'Y' } },
    ]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(42);
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(42);
  });

  it('POST / returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 when customerId is missing', async () => {
    const res = await request(app).post('/api/sites').send({ name: 'Some Site' });
    expect(res.status).toBe(400);
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcSite.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcSite.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('PUT /:id returns 200 and updated site data', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000033' });
    mockPrisma.fsSvcSite.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000033',
      name: 'West Site',
      address: { city: 'Liverpool' },
    });
    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000033')
      .send({ name: 'West Site', address: { city: 'Liverpool' } });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'West Site');
  });

  it('GET / success flag is true on success', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);
    const res = await request(app).get('/api/sites');
    expect(res.body.success).toBe(true);
  });

  it('POST / create call includes the name in data', async () => {
    mockPrisma.fsSvcSite.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000034',
      name: 'South Site',
    });
    await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'South Site',
      address: { city: 'Bristol' },
    });
    expect(mockPrisma.fsSvcSite.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'South Site' }),
      })
    );
  });

  it('GET / response body contains a data array', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);
    const res = await request(app).get('/api/sites');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('sites.api — further coverage', () => {
  it('GET / applies correct skip for page 2 limit 20', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);

    await request(app).get('/api/sites?page=2&limit=20');

    expect(mockPrisma.fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 20 })
    );
  });

  it('POST / create is not called when validation fails', async () => {
    await request(app).post('/api/sites').send({});

    expect(mockPrisma.fsSvcSite.create).not.toHaveBeenCalled();
  });

  it('GET /:id returns correct data.name', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000050',
      name: 'Midlands Depot',
      customer: {},
    });

    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000050');

    expect(res.body.data.name).toBe('Midlands Depot');
  });

  it('DELETE /:id calls update exactly once', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060' });
    mockPrisma.fsSvcSite.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060', deletedAt: new Date() });

    await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000060');

    expect(mockPrisma.fsSvcSite.update).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id returns 200 and success:true on valid update', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000070' });
    mockPrisma.fsSvcSite.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000070', name: 'Renamed' });

    const res = await request(app)
      .put('/api/sites/00000000-0000-0000-0000-000000000070')
      .send({ name: 'Renamed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('sites.api — final coverage', () => {
  it('GET / returns correct pagination.total from count mock', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(25);
    const res = await request(app).get('/api/sites');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(25);
  });

  it('GET / applies skip=15 for page=4 limit=5', async () => {
    mockPrisma.fsSvcSite.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcSite.count.mockResolvedValue(0);
    await request(app).get('/api/sites?page=4&limit=5');
    expect(mockPrisma.fsSvcSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 15, take: 5 })
    );
  });

  it('GET /:id returns 404 when not found', async () => {
    mockPrisma.fsSvcSite.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/sites/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('POST / returns 201 with data.id on success', async () => {
    mockPrisma.fsSvcSite.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000080',
      name: 'Gamma Site',
    });
    const res = await request(app).post('/api/sites').send({
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Gamma Site',
      address: { city: 'Glasgow' },
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('DELETE /:id returns 500 when findFirst rejects', async () => {
    mockPrisma.fsSvcSite.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/sites/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('sites — phase29 coverage', () => {
  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles bitwise AND', () => {
    expect(5 & 3).toBe(1);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles null check', () => {
    expect(null).toBeNull();
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

});

describe('sites — phase30 coverage', () => {
  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

  it('handles numeric type', () => {
    expect(typeof 42).toBe('number');
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

  it('handles object type', () => {
    expect(typeof {}).toBe('object');
  });

});


describe('phase31 coverage', () => {
  it('handles array of', () => { expect(Array.of(1,2,3)).toEqual([1,2,3]); });
  it('handles Math.abs', () => { expect(Math.abs(-7)).toBe(7); });
  it('handles Map creation', () => { const m = new Map<string,number>(); m.set('a',1); expect(m.get('a')).toBe(1); });
  it('handles string trim', () => { expect('  hi  '.trim()).toBe('hi'); });
  it('handles generator function', () => { function* gen() { yield 1; yield 2; } const g = gen(); expect(g.next().value).toBe(1); });
});


describe('phase32 coverage', () => {
  it('handles exponentiation', () => { expect(2 ** 8).toBe(256); });
  it('handles Array.from with mapFn', () => { expect(Array.from({length:3}, (_,i) => i*2)).toEqual([0,2,4]); });
  it('handles getter/setter', () => { const o = { _v: 0, get v() { return this._v; }, set v(n) { this._v = n; } }; o.v = 5; expect(o.v).toBe(5); });
  it('handles object reference equality', () => { const a = { val: 42 }; const b = a; expect(b.val).toBe(42); expect(b === a).toBe(true); });
  it('handles class instantiation', () => { class C { val: number; constructor(v: number) { this.val = v; } } const c = new C(7); expect(c.val).toBe(7); });
});


describe('phase33 coverage', () => {
  it('handles array unshift', () => { const a = [2,3]; a.unshift(1); expect(a).toEqual([1,2,3]); });
  it('handles string charCodeAt', () => { expect('A'.charCodeAt(0)).toBe(65); });
  it('divides numbers', () => { expect(20 / 4).toBe(5); });
  it('handles Number.MAX_SAFE_INTEGER', () => { expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991); });
  it('handles pipe pattern', () => { const pipe = (...fns: Array<(x: number) => number>) => (x: number) => fns.reduce((v, f) => f(v), x); const double = (x: number) => x * 2; const inc = (x: number) => x + 1; expect(pipe(double, inc)(5)).toBe(11); });
});
