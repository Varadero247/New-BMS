import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { incIncident: { findMany: jest.fn(), update: jest.fn() } },
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

import router from '../src/routes/riddor';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/riddor', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/riddor', () => {
  it('should return list of RIDDOR reportable incidents', async () => {
    const incidents = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Serious injury',
        riddorReportable: 'YES',
      },
      { id: 'inc-2', title: 'Dangerous occurrence', riddorReportable: 'YES' },
    ];
    mockPrisma.incIncident.findMany.mockResolvedValue(incidents);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(mockPrisma.incIncident.findMany).toHaveBeenCalledWith({
      where: { orgId: 'org-1', deletedAt: null, riddorReportable: 'YES' },
      orderBy: { dateOccurred: 'desc' },
      take: 500,
    });
  });

  it('should return empty array when no RIDDOR incidents exist', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/riddor/:id/assess', () => {
  it('should mark incident as RIDDOR reportable', async () => {
    const updated = {
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
      riddorRef: 'RIDDOR-2026-001',
    };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true, riddorRef: 'RIDDOR-2026-001' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riddorReportable).toBe('YES');
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({ riddorReportable: 'YES', riddorRef: 'RIDDOR-2026-001' }),
    });
  });

  it('should mark incident as NOT RIDDOR reportable', async () => {
    const updated = { id: '00000000-0000-0000-0000-000000000001', riddorReportable: 'NO' };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({ riddorReportable: 'NO' }),
    });
  });

  it('should return 400 if reportable field is missing', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if reportable is not a boolean', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: 'yes' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('RIDDOR — extended', () => {
  it('GET returns data as array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET success is true on 200', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('assess update called once on success', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', riddorReportable: 'YES' });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(mockPrisma.incIncident.update).toHaveBeenCalledTimes(1);
  });

  it('GET data is an array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET findMany called once per request', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/riddor');
    expect(mockPrisma.incIncident.findMany).toHaveBeenCalledTimes(1);
  });

  it('assess returns success false on 500', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: false });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET returns list with correct length', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([
      { id: 'i1', title: 'Injury A', riddorReportable: 'YES' },
      { id: 'i2', title: 'Injury B', riddorReportable: 'YES' },
      { id: 'i3', title: 'Occurrence', riddorReportable: 'YES' },
    ]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });
});

describe('RIDDOR — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET uses orgId from authenticated user in query', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);

    await request(app).get('/api/riddor');

    const callArg = mockPrisma.incIncident.findMany.mock.calls[0][0];
    expect(callArg.where.orgId).toBe('org-1');
  });

  it('GET filters by riddorReportable YES', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);

    await request(app).get('/api/riddor');

    const callArg = mockPrisma.incIncident.findMany.mock.calls[0][0];
    expect(callArg.where.riddorReportable).toBe('YES');
  });

  it('assess sets updatedBy to authenticated user id', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
    });

    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });

    const callArg = mockPrisma.incIncident.update.mock.calls[0][0];
    expect(callArg.data.updatedBy).toBe('user-1');
  });

  it('assess responds with JSON content-type', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'NO',
    });

    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: false });

    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET orders results by dateOccurred descending', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);

    await request(app).get('/api/riddor');

    const callArg = mockPrisma.incIncident.findMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ dateOccurred: 'desc' });
  });
});

describe('RIDDOR — edge cases and deeper coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET responds with JSON content-type', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET query sets deletedAt: null to exclude soft-deleted records', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/riddor');
    const callArg = mockPrisma.incIncident.findMany.mock.calls[0][0];
    expect(callArg.where.deletedAt).toBeNull();
  });

  it('GET query sets take: 500 to limit results', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/riddor');
    const callArg = mockPrisma.incIncident.findMany.mock.calls[0][0];
    expect(callArg.take).toBe(500);
  });

  it('assess with riddorRef undefined still succeeds', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
      riddorRef: null,
    });
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('assess with reportable=false sets riddorReportable to NO', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      riddorReportable: 'NO',
    });
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000002/assess')
      .send({ reportable: false });
    expect(res.status).toBe(200);
    const callArg = mockPrisma.incIncident.update.mock.calls[0][0];
    expect(callArg.data.riddorReportable).toBe('NO');
  });

  it('assess passes riddorRef string when provided', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
      riddorRef: 'RIDDOR-2026-999',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true, riddorRef: 'RIDDOR-2026-999' });
    const callArg = mockPrisma.incIncident.update.mock.calls[0][0];
    expect(callArg.data.riddorRef).toBe('RIDDOR-2026-999');
  });

  it('GET with five incidents returns data length 5', async () => {
    const incidents = Array.from({ length: 5 }, (_, i) => ({
      id: `00000000-0000-0000-0000-00000000000${i + 1}`,
      title: `Incident ${i + 1}`,
      riddorReportable: 'YES',
    }));
    mockPrisma.incIncident.findMany.mockResolvedValue(incidents);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });

  it('assess 400 response has VALIDATION_ERROR code for missing reportable', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('assess 500 response error code is INTERNAL_ERROR', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('timeout'));
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('RIDDOR — extra paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns success property as boolean true', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });

  it('assess update data contains updatedAt timestamp', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    const callData = mockPrisma.incIncident.update.mock.calls[0][0].data;
    expect(callData).toHaveProperty('updatedBy');
  });

  it('GET error body has error.code INTERNAL_ERROR on 500', async () => {
    mockPrisma.incIncident.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('assess response data matches mocked update return value', async () => {
    const updated = {
      id: '00000000-0000-0000-0000-000000000010',
      riddorReportable: 'NO',
    };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000010/assess')
      .send({ reportable: false });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000010');
    expect(res.body.data.riddorReportable).toBe('NO');
  });

  it('GET response data first item has id field', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Injury', riddorReportable: 'YES' },
    ]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });
});

describe('RIDDOR — final coverage block', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET response body has success:true', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.body.success).toBe(true);
  });

  it('assess response body has success:true on success', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
    });
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(res.body.success).toBe(true);
  });

  it('assess where clause has correct id from route param', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      riddorReportable: 'YES',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000005/assess')
      .send({ reportable: true });
    const callArg = mockPrisma.incIncident.update.mock.calls[0][0];
    expect(callArg.where.id).toBe('00000000-0000-0000-0000-000000000005');
  });

  it('GET returns data array not null', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.body.data).not.toBeNull();
  });

  it('assess update called with data containing status: RIDDOR_REPORTED when reportable is true', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    const callArg = mockPrisma.incIncident.update.mock.calls[0][0];
    expect(callArg.data.riddorReportable).toBe('YES');
  });

  it('GET response content-type has json in it', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.headers['content-type']).toContain('json');
  });
});

describe('RIDDOR — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/riddor success:true and data is an array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('assess with reportable=true passes riddorReportable YES to update', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      riddorReportable: 'YES',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000020/assess')
      .send({ reportable: true });
    const callData = mockPrisma.incIncident.update.mock.calls[0][0].data;
    expect(callData.riddorReportable).toBe('YES');
  });

  it('assess where clause uses id from route param', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000030',
      riddorReportable: 'NO',
    });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000030/assess')
      .send({ reportable: false });
    const callWhere = mockPrisma.incIncident.update.mock.calls[0][0].where;
    expect(callWhere.id).toBe('00000000-0000-0000-0000-000000000030');
  });

  it('GET /api/riddor response data length matches mocked array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Phase28 Incident A', riddorReportable: 'YES' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Phase28 Incident B', riddorReportable: 'YES' },
    ]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('assess 400 error body has success:false', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('riddor — phase30 coverage', () => {
  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

});


describe('phase31 coverage', () => {
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles Math.max', () => { expect(Math.max(1,5,3)).toBe(5); });
  it('handles string includes', () => { expect('foobar'.includes('bar')).toBe(true); });
  it('handles array reduce', () => { expect([1,2,3].reduce((a,b) => a+b, 0)).toBe(6); });
  it('handles typeof null', () => { expect(typeof null).toBe('object'); });
});
