import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockCreateSchedule = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Weekly Quality Summary',
  reportType: 'quality_objectives',
  schedule: '0 8 * * 1',
});
const mockListSchedules = jest.fn().mockReturnValue([]);
const mockGetSchedule = jest
  .fn()
  .mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Weekly Quality Summary' });
const mockUpdateSchedule = jest
  .fn()
  .mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
const mockDeleteSchedule = jest.fn().mockReturnValue(true);
const mockRunScheduleNow = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  lastRunAt: new Date().toISOString(),
});

jest.mock('@ims/scheduled-reports', () => ({
  createSchedule: (...args: any[]) => mockCreateSchedule(...args),
  listSchedules: (...args: any[]) => mockListSchedules(...args),
  getSchedule: (...args: any[]) => mockGetSchedule(...args),
  updateSchedule: (...args: any[]) => mockUpdateSchedule(...args),
  deleteSchedule: (...args: any[]) => mockDeleteSchedule(...args),
  runScheduleNow: (...args: any[]) => mockRunScheduleNow(...args),
  REPORT_TYPES: [
    {
      value: 'quality_objectives',
      label: 'Quality Objectives Report',
      description: 'Progress against quality objectives',
    },
    {
      value: 'open_actions',
      label: 'Open Actions Summary',
      description: 'Summary of open corrective actions',
    },
  ],
}));

import scheduledReportsRouter from '../src/routes/scheduled-reports';

describe('Scheduled Reports Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/reports', scheduledReportsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/reports/types', () => {
    it('returns available report types', async () => {
      const res = await request(app).get('/api/admin/reports/types');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/reports/schedules', () => {
    it('lists report schedules', async () => {
      const res = await request(app).get('/api/admin/reports/schedules');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/reports/schedules', () => {
    it('creates a report schedule', async () => {
      const res = await request(app)
        .post('/api/admin/reports/schedules')
        .send({
          name: 'Weekly Quality Summary',
          reportType: 'quality_objectives',
          schedule: '0 8 * * 1',
          recipients: ['quality@ims.local'],
          format: 'pdf',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing name', async () => {
      const res = await request(app)
        .post('/api/admin/reports/schedules')
        .send({ reportType: 'quality_objectives', schedule: '0 8 * * 1' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/reports/schedules/:id', () => {
    it('returns a schedule', async () => {
      const res = await request(app).get(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent', async () => {
      mockGetSchedule.mockReturnValueOnce(undefined);
      const res = await request(app).get(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/reports/schedules/:id', () => {
    it('updates a schedule', async () => {
      const res = await request(app)
        .put('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Monthly Report' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/admin/reports/schedules/:id', () => {
    it('deletes a schedule', async () => {
      const res = await request(app).delete(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/admin/reports/schedules/:id/run', () => {
    it('triggers manual run', async () => {
      const res = await request(app).post(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001/run'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Auth enforcement', () => {
    it('requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/reports/schedules');
      expect(res.status).toBe(403);
    });
  });

  describe('Scheduled Reports — extended', () => {
    it('GET /types returns data as array', async () => {
      const res = await request(app).get('/api/admin/reports/types');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /schedules returns data as array', async () => {
      mockListSchedules.mockReturnValue([]);
      const res = await request(app).get('/api/admin/reports/schedules');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST schedule returns id in response', async () => {
      const res = await request(app)
        .post('/api/admin/reports/schedules')
        .send({
          name: 'Monthly ESG Summary',
          reportType: 'open_actions',
          schedule: '0 9 1 * *',
          recipients: ['esg@ims.local'],
          format: 'pdf',
        });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('DELETE schedule returns success true', async () => {
      const res = await request(app).delete(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('run now returns lastRunAt field', async () => {
      const res = await request(app).post(
        '/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001/run'
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('lastRunAt');
    });
  });
});

describe('Scheduled Reports — additional coverage', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/admin/reports', scheduledReportsRouter);
    jest.clearAllMocks();
    // Reset mocks to defaults
    mockListSchedules.mockReturnValue([]);
    mockGetSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Weekly Quality Summary' });
    mockUpdateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
    mockDeleteSchedule.mockReturnValue(true);
    mockRunScheduleNow.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', lastRunAt: new Date().toISOString() });
    mockCreateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Weekly Quality Summary', reportType: 'quality_objectives', schedule: '0 8 * * 1' });
  });

  it('GET /types returns at least one report type', async () => {
    const res = await request(app).get('/api/admin/reports/types');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PUT /schedules/:id updates name field in response', async () => {
    const res = await request(app)
      .put('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Schedule' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Updated');
  });

  it('POST /schedules rejects missing reportType', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'My Report', schedule: '0 8 * * 1', recipients: ['a@b.com'], format: 'pdf' });
    expect(res.status).toBe(400);
  });

  it('POST /schedules rejects missing recipients', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'My Report', reportType: 'quality_objectives', schedule: '0 8 * * 1', format: 'pdf' });
    expect(res.status).toBe(400);
  });

  it('GET /schedules/:id returns schedule with id field', async () => {
    const res = await request(app).get('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', '00000000-0000-0000-0000-000000000001');
  });
});

describe('Scheduled Reports — error paths and edge cases', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/admin/reports', scheduledReportsRouter);
    jest.clearAllMocks();
    mockListSchedules.mockReturnValue([]);
    mockGetSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test' });
    mockUpdateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
    mockDeleteSchedule.mockReturnValue(true);
    mockRunScheduleNow.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', lastRunAt: new Date().toISOString() });
    mockCreateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test', reportType: 'quality_objectives', schedule: '0 8 * * 1' });
  });

  it('GET /schedules returns meta.total field', async () => {
    mockListSchedules.mockReturnValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
    const res = await request(app).get('/api/admin/reports/schedules');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('PUT /schedules/:id returns 404 when schedule not found', async () => {
    mockUpdateSchedule.mockReturnValueOnce(undefined);
    const res = await request(app)
      .put('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /schedules/:id returns 404 when schedule not found', async () => {
    mockDeleteSchedule.mockReturnValueOnce(false);
    const res = await request(app).delete('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /schedules/:id/run returns 404 when schedule not found', async () => {
    mockRunScheduleNow.mockReturnValueOnce(undefined);
    const res = await request(app).post('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000099/run');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /schedules rejects invalid format value', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'Test', reportType: 'quality_objectives', schedule: '0 8 * * 1', recipients: ['a@b.com'], format: 'docx' });
    expect(res.status).toBe(400);
  });

  it('GET /schedules returns success true even when list is empty', async () => {
    mockListSchedules.mockReturnValue([]);
    const res = await request(app).get('/api/admin/reports/schedules');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('run now response data has message field', async () => {
    const res = await request(app).post('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001/run');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('DELETE /schedules/:id response data has deleted true', async () => {
    const res = await request(app).delete('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('deleted', true);
  });

  it('GET /types returns data with value and label on each entry', async () => {
    const res = await request(app).get('/api/admin/reports/types');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('value');
    expect(res.body.data[0]).toHaveProperty('label');
  });

  it('POST /schedules accepts format excel', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'Excel Report', reportType: 'quality_objectives', schedule: '0 8 * * 1', recipients: ['a@b.com'], format: 'excel' });
    expect(res.status).toBe(201);
  });
});

describe('Scheduled Reports — final coverage batch', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/admin/reports', scheduledReportsRouter);
    jest.clearAllMocks();
    mockListSchedules.mockReturnValue([]);
    mockGetSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test' });
    mockUpdateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
    mockDeleteSchedule.mockReturnValue(true);
    mockRunScheduleNow.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', lastRunAt: new Date().toISOString() });
    mockCreateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test', reportType: 'quality_objectives', schedule: '0 8 * * 1' });
  });

  it('GET /types response is JSON content-type', async () => {
    const res = await request(app).get('/api/admin/reports/types');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /schedules response is JSON content-type', async () => {
    const res = await request(app).get('/api/admin/reports/schedules');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /schedules rejects missing schedule cron expression', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'No Cron', reportType: 'quality_objectives', recipients: ['a@b.com'], format: 'pdf' });
    expect(res.status).toBe(400);
  });

  it('GET /schedules/:id response body has success true', async () => {
    const res = await request(app).get('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('createSchedule is called once per POST request', async () => {
    await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'Call Count Test', reportType: 'quality_objectives', schedule: '0 8 * * 1', recipients: ['x@y.com'], format: 'pdf' });
    expect(mockCreateSchedule).toHaveBeenCalledTimes(1);
  });
});

describe('Scheduled Reports — extended final batch', () => {
  let app: import('express').Express;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/admin/reports', scheduledReportsRouter);
    jest.clearAllMocks();
    mockListSchedules.mockReturnValue([]);
    mockGetSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test' });
    mockUpdateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });
    mockDeleteSchedule.mockReturnValue(true);
    mockRunScheduleNow.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', lastRunAt: new Date().toISOString() });
    mockCreateSchedule.mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test', reportType: 'quality_objectives', schedule: '0 8 * * 1' });
  });

  it('GET /schedules response body has meta field', async () => {
    const res = await request(app).get('/api/admin/reports/schedules');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /schedules returns 201 with schedule field in data', async () => {
    const res = await request(app)
      .post('/api/admin/reports/schedules')
      .send({ name: 'Final Test', reportType: 'quality_objectives', schedule: '0 8 * * 1', recipients: ['final@b.com'], format: 'pdf' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('schedule');
  });

  it('GET /types count is 2 from mock REPORT_TYPES', async () => {
    const res = await request(app).get('/api/admin/reports/types');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /schedules/:id name field is present in response', async () => {
    const res = await request(app).get('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name');
  });

  it('PUT /schedules/:id response body has success true', async () => {
    const res = await request(app)
      .put('/api/admin/reports/schedules/00000000-0000-0000-0000-000000000001')
      .send({ name: 'New name' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
