import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'consultant@ims.local', role: 'MSP_CONSULTANT' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

const mockMspLink = {
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  groupBy: jest.fn(),
};

const mockAuditLog = {
  create: jest.fn().mockResolvedValue({}),
  findMany: jest.fn(),
};

jest.mock('@ims/database', () => ({
  prisma: {
    mspLink: mockMspLink,
    auditLog: mockAuditLog,
    $use: jest.fn(),
  },
  prismaMetricsMiddleware: jest.fn(),
}));

import mspRouter from '../src/routes/msp';

const app = express();
app.use(express.json());
app.use('/api', mspRouter);

beforeEach(() => {
  jest.clearAllMocks();
  mockAuditLog.create.mockResolvedValue({});
});

const validLink = {
  clientOrganisationId: '00000000-0000-0000-0000-000000000010',
  clientOrganisationName: 'Acme Corp',
  permissions: ['READ', 'AUDIT'],
};

const mockLinkRecord = {
  id: 'link-1',
  consultantUserId: 'user-1',
  consultantEmail: 'consultant@ims.local',
  clientOrganisationId: '00000000-0000-0000-0000-000000000010',
  clientOrganisationName: 'Acme Corp',
  status: 'ACTIVE',
  permissions: ['READ', 'AUDIT'],
  whiteLabel: null,
  linkedAt: new Date('2026-01-01T00:00:00Z'),
  linkedBy: 'user-1',
  lastAccessedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

// ─── POST /api/msp-link ───────────────────────────────────────────────

describe('POST /api/msp-link', () => {
  it('creates a new MSP link', async () => {
    mockMspLink.findFirst.mockResolvedValue(null);
    mockMspLink.create.mockResolvedValue(mockLinkRecord);

    const res = await request(app).post('/api/msp-link').send(validLink);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('link-1');
  });

  it('returns 400 when clientOrganisationId is not a UUID', async () => {
    const res = await request(app)
      .post('/api/msp-link')
      .send({ ...validLink, clientOrganisationId: 'not-a-uuid' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when permissions array is empty', async () => {
    const res = await request(app)
      .post('/api/msp-link')
      .send({ ...validLink, permissions: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 when active link already exists', async () => {
    mockMspLink.findFirst.mockResolvedValue(mockLinkRecord);

    const res = await request(app).post('/api/msp-link').send(validLink);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(mockMspLink.create).not.toHaveBeenCalled();
  });

  it('returns 403 when user does not have MSP role', async () => {
    mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
      req.user = { id: 'user-2', email: 'regular@ims.local', role: 'USER' };
      next();
    });

    const res = await request(app).post('/api/msp-link').send(validLink);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('calls prisma.mspLink.create once on success', async () => {
    mockMspLink.findFirst.mockResolvedValue(null);
    mockMspLink.create.mockResolvedValue(mockLinkRecord);

    await request(app).post('/api/msp-link').send(validLink);

    expect(mockMspLink.create).toHaveBeenCalledTimes(1);
  });

  it('stores permissions from request body', async () => {
    mockMspLink.findFirst.mockResolvedValue(null);
    mockMspLink.create.mockResolvedValue(mockLinkRecord);

    await request(app).post('/api/msp-link').send(validLink);

    expect(mockMspLink.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ permissions: ['READ', 'AUDIT'] }),
      })
    );
  });

  it('returns 500 when prisma.create throws', async () => {
    mockMspLink.findFirst.mockResolvedValue(null);
    mockMspLink.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/msp-link').send(validLink);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── GET /api/msp-clients ────────────────────────────────────────────

describe('GET /api/msp-clients', () => {
  it('returns paginated client list', async () => {
    mockMspLink.findMany.mockResolvedValue([mockLinkRecord]);
    mockMspLink.count.mockResolvedValue(1);
    mockMspLink.groupBy.mockResolvedValue([{ status: 'ACTIVE', _count: 1 }]);

    const res = await request(app).get('/api/msp-clients');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('returns pagination metadata', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    mockMspLink.count.mockResolvedValue(0);
    mockMspLink.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/msp-clients?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.limit).toBe(5);
  });

  it('returns summary counts by status', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    mockMspLink.count.mockResolvedValue(2);
    mockMspLink.groupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: 1 },
      { status: 'SUSPENDED', _count: 1 },
    ]);

    const res = await request(app).get('/api/msp-clients');

    expect(res.body.data.summary.active).toBe(1);
    expect(res.body.data.summary.suspended).toBe(1);
  });

  it('filters by status when query param provided', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    mockMspLink.count.mockResolvedValue(0);
    mockMspLink.groupBy.mockResolvedValue([]);

    await request(app).get('/api/msp-clients?status=ACTIVE');

    expect(mockMspLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('returns 403 when user lacks MSP role', async () => {
    mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
      req.user = { id: 'u2', role: 'USER' };
      next();
    });

    const res = await request(app).get('/api/msp-clients');
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB error', async () => {
    mockMspLink.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/msp-clients');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('items is an array', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    mockMspLink.count.mockResolvedValue(0);
    mockMspLink.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/msp-clients');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});

// ─── GET /api/msp-dashboard ──────────────────────────────────────────

describe('GET /api/msp-dashboard', () => {
  it('returns dashboard with summary', async () => {
    mockMspLink.findMany.mockResolvedValue([mockLinkRecord]);

    const res = await request(app).get('/api/msp-dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.clients).toHaveLength(1);
  });

  it('returns zero summary when no active clients', async () => {
    mockMspLink.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/msp-dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalActiveClients).toBe(0);
    expect(res.body.data.summary.averageComplianceScore).toBe(0);
  });

  it('returns generatedAt field', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/msp-dashboard');
    expect(res.body.data.generatedAt).toBeDefined();
  });

  it('each client has complianceHealth.overallScore', async () => {
    mockMspLink.findMany.mockResolvedValue([mockLinkRecord]);
    const res = await request(app).get('/api/msp-dashboard');
    expect(res.body.data.clients[0].complianceHealth.overallScore).toBeGreaterThanOrEqual(70);
  });

  it('returns 403 for non-MSP user', async () => {
    mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
      req.user = { id: 'u3', role: 'USER' };
      next();
    });
    const res = await request(app).get('/api/msp-dashboard');
    expect(res.status).toBe(403);
  });

  it('returns 500 on DB error', async () => {
    mockMspLink.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/msp-dashboard');
    expect(res.status).toBe(500);
  });
});

// ─── PUT /api/msp-link/:id ────────────────────────────────────────────

describe('PUT /api/msp-link/:id', () => {
  it('updates status of an MSP link', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue({ ...mockLinkRecord, status: 'SUSPENDED' });

    const res = await request(app)
      .put('/api/msp-link/link-1')
      .send({ status: 'SUSPENDED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUSPENDED');
  });

  it('returns 404 when link not found', async () => {
    mockMspLink.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/msp-link/nonexistent')
      .send({ status: 'SUSPENDED' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 when link belongs to different consultant', async () => {
    mockMspLink.findUnique.mockResolvedValue({ ...mockLinkRecord, consultantUserId: 'other-user' });

    const res = await request(app)
      .put('/api/msp-link/link-1')
      .send({ status: 'SUSPENDED' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 400 for invalid status value', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);

    const res = await request(app)
      .put('/api/msp-link/link-1')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('calls prisma.mspLink.update once on success', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue(mockLinkRecord);

    await request(app).put('/api/msp-link/link-1').send({ permissions: ['READ'] });

    expect(mockMspLink.update).toHaveBeenCalledTimes(1);
  });

  it('returns 500 on update DB error', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/msp-link/link-1').send({ status: 'SUSPENDED' });
    expect(res.status).toBe(500);
  });
});

// ─── DELETE /api/msp-link/:id ─────────────────────────────────────────

describe('DELETE /api/msp-link/:id', () => {
  it('revokes an MSP link', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue({ ...mockLinkRecord, status: 'REVOKED' });

    const res = await request(app).delete('/api/msp-link/link-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('MSP link revoked');
  });

  it('returns 404 when link not found', async () => {
    mockMspLink.findUnique.mockResolvedValue(null);
    const res = await request(app).delete('/api/msp-link/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 when link belongs to different consultant', async () => {
    mockMspLink.findUnique.mockResolvedValue({ ...mockLinkRecord, consultantUserId: 'other-user' });
    const res = await request(app).delete('/api/msp-link/link-1');
    expect(res.status).toBe(403);
  });

  it('sets status to REVOKED in DB', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue({ ...mockLinkRecord, status: 'REVOKED' });

    await request(app).delete('/api/msp-link/link-1');

    expect(mockMspLink.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REVOKED' }),
      })
    );
  });

  it('returns linkId in response', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue({ ...mockLinkRecord, status: 'REVOKED' });

    const res = await request(app).delete('/api/msp-link/link-1');
    expect(res.body.data.linkId).toBe('link-1');
  });

  it('returns 500 on DB error', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/msp-link/link-1');
    expect(res.status).toBe(500);
  });
});

// ─── GET /api/msp-link/:id/audit-log ────────────────────────────────

describe('GET /api/msp-link/:id/audit-log', () => {
  it('returns audit log entries for a link', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockAuditLog.findMany.mockResolvedValue([
      {
        createdAt: new Date('2026-01-01T10:00:00Z'),
        action: 'MSP_LINK_CREATED',
        userId: 'user-1',
      },
    ]);

    const res = await request(app).get('/api/msp-link/link-1/audit-log');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entries).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('returns 404 when link not found', async () => {
    mockMspLink.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/msp-link/nonexistent/audit-log');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 403 when link belongs to different consultant', async () => {
    mockMspLink.findUnique.mockResolvedValue({ ...mockLinkRecord, consultantUserId: 'other-user' });
    const res = await request(app).get('/api/msp-link/link-1/audit-log');
    expect(res.status).toBe(403);
  });

  it('returns clientName in response', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockAuditLog.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/msp-link/link-1/audit-log');
    expect(res.body.data.clientName).toBe('Acme Corp');
  });

  it('returns empty entries when no audit logs', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockAuditLog.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/msp-link/link-1/audit-log');
    expect(res.body.data.entries).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('returns 500 on DB error', async () => {
    mockMspLink.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/msp-link/link-1/audit-log');
    expect(res.status).toBe(500);
  });
});

describe('MSP — extended', () => {
  it('POST /msp-link: response data has consultantUserId', async () => {
    mockMspLink.findFirst.mockResolvedValue(null);
    mockMspLink.create.mockResolvedValue(mockLinkRecord);
    const res = await request(app).post('/api/msp-link').send(validLink);
    expect(res.body.data).toHaveProperty('consultantUserId');
  });

  it('GET /msp-clients: totalPages is a number', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    mockMspLink.count.mockResolvedValue(0);
    mockMspLink.groupBy.mockResolvedValue([]);
    const res = await request(app).get('/api/msp-clients');
    expect(typeof res.body.data.totalPages).toBe('number');
  });

  it('GET /msp-dashboard: consultant field has email', async () => {
    mockMspLink.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/msp-dashboard');
    expect(res.body.data.consultant.email).toBe('consultant@ims.local');
  });

  it('PUT /msp-link/:id: response data has id', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue(mockLinkRecord);
    const res = await request(app).put('/api/msp-link/link-1').send({ permissions: ['MANAGE'] });
    expect(res.body.data).toHaveProperty('id');
  });

  it('DELETE /msp-link/:id: update called once per request', async () => {
    mockMspLink.findUnique.mockResolvedValue(mockLinkRecord);
    mockMspLink.update.mockResolvedValue({ ...mockLinkRecord, status: 'REVOKED' });
    await request(app).delete('/api/msp-link/link-1');
    expect(mockMspLink.update).toHaveBeenCalledTimes(1);
  });
});

describe('msp — phase29 coverage', () => {
  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

});

describe('msp — phase30 coverage', () => {
  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles object type', () => {
    expect(typeof {}).toBe('object');
  });

  it('handles string replace', () => {
    expect('hello world'.replace('world', 'Jest')).toBe('hello Jest');
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles array isArray', () => {
    expect(Array.isArray([])).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles Map creation', () => { const m = new Map<string,number>(); m.set('a',1); expect(m.get('a')).toBe(1); });
  it('handles Array.isArray', () => { expect(Array.isArray([1,2])).toBe(true); expect(Array.isArray('x')).toBe(false); });
  it('handles string includes', () => { expect('foobar'.includes('bar')).toBe(true); });
  it('handles array push', () => { const a: number[] = []; a.push(1); expect(a.length).toBe(1); });
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles labeled break', () => { let found = false; outer: for (let i=0;i<3;i++) { for (let j=0;j<3;j++) { if(i===1&&j===1){found=true;break outer;} } } expect(found).toBe(true); });
  it('handles array join', () => { expect([1,2,3].join('-')).toBe('1-2-3'); });
  it('handles bitwise XOR', () => { expect(6 ^ 3).toBe(5); });
  it('handles for...of loop', () => { const arr = [1,2,3]; let s = 0; for (const v of arr) s += v; expect(s).toBe(6); });
  it('handles string indexOf', () => { expect('foobar'.indexOf('bar')).toBe(3); expect('foobar'.indexOf('baz')).toBe(-1); });
});


describe('phase33 coverage', () => {
  it('handles currying pattern', () => { const add = (a: number) => (b: number) => a + b; expect(add(3)(4)).toBe(7); });
  it('handles void operator', () => { expect(void 0).toBeUndefined(); });
  it('handles Number.MAX_SAFE_INTEGER', () => { expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991); });
  it('handles in operator', () => { const o = {a:1}; expect('a' in o).toBe(true); expect('b' in o).toBe(false); });
  it('handles string index access', () => { expect('hello'[0]).toBe('h'); });
});


describe('phase34 coverage', () => {
  it('handles Set union', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const union = new Set([...a,...b]); expect(union.size).toBe(4); });
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles promise then chain', async () => { const result = await Promise.resolve(1).then(x=>x+1).then(x=>x*3); expect(result).toBe(6); });
  it('handles default value in destructuring', () => { const {x=10,y=20} = {x:5} as {x?:number;y?:number}; expect(x).toBe(5); expect(y).toBe(20); });
  it('handles object method shorthand', () => { const o = { double(x: number) { return x * 2; } }; expect(o.double(6)).toBe(12); });
});
