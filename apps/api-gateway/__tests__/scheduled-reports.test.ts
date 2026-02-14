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
  id: 'sr-1', name: 'Weekly Quality Summary', reportType: 'quality_objectives', schedule: '0 8 * * 1',
});
const mockListSchedules = jest.fn().mockReturnValue([]);
const mockGetSchedule = jest.fn().mockReturnValue({ id: 'sr-1', name: 'Weekly Quality Summary' });
const mockUpdateSchedule = jest.fn().mockReturnValue({ id: 'sr-1', name: 'Updated' });
const mockDeleteSchedule = jest.fn().mockReturnValue(true);
const mockRunScheduleNow = jest.fn().mockReturnValue({ id: 'sr-1', lastRunAt: new Date().toISOString() });

jest.mock('@ims/scheduled-reports', () => ({
  createSchedule: (...args: any[]) => mockCreateSchedule(...args),
  listSchedules: (...args: any[]) => mockListSchedules(...args),
  getSchedule: (...args: any[]) => mockGetSchedule(...args),
  updateSchedule: (...args: any[]) => mockUpdateSchedule(...args),
  deleteSchedule: (...args: any[]) => mockDeleteSchedule(...args),
  runScheduleNow: (...args: any[]) => mockRunScheduleNow(...args),
  REPORT_TYPES: [
    { value: 'quality_objectives', label: 'Quality Objectives Report', description: 'Progress against quality objectives' },
    { value: 'open_actions', label: 'Open Actions Summary', description: 'Summary of open corrective actions' },
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
      const res = await request(app).get('/api/admin/reports/schedules/sr-1');
      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent', async () => {
      mockGetSchedule.mockReturnValueOnce(undefined);
      const res = await request(app).get('/api/admin/reports/schedules/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/reports/schedules/:id', () => {
    it('updates a schedule', async () => {
      const res = await request(app)
        .put('/api/admin/reports/schedules/sr-1')
        .send({ name: 'Monthly Report' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/admin/reports/schedules/:id', () => {
    it('deletes a schedule', async () => {
      const res = await request(app).delete('/api/admin/reports/schedules/sr-1');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/admin/reports/schedules/:id/run', () => {
    it('triggers manual run', async () => {
      const res = await request(app).post('/api/admin/reports/schedules/sr-1/run');
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
});
