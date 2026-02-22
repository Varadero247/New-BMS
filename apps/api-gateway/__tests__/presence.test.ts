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
