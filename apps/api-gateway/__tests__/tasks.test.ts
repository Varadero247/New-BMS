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

const mockCreateTask = jest.fn().mockResolvedValue({ id: 't1', refNumber: 'TSK-2602-001', title: 'Test Task', status: 'OPEN' });
const mockGetTasks = jest.fn().mockResolvedValue({ tasks: [], total: 0 });
const mockGetTaskById = jest.fn().mockResolvedValue({ id: 't1', title: 'Test', assigneeId: 'user-1', status: 'OPEN' });
const mockUpdateTask = jest.fn().mockResolvedValue({ id: 't1', title: 'Updated', status: 'IN_PROGRESS' });
const mockCompleteTask = jest.fn().mockResolvedValue({ id: 't1', status: 'COMPLETE', completedAt: new Date().toISOString() });
const mockDeleteTask = jest.fn().mockResolvedValue(undefined);
const mockGetMyTasks = jest.fn().mockResolvedValue({ overdue: [], today: [], thisWeek: [], later: [] });

jest.mock('@ims/tasks', () => ({
  createTask: (...args: any[]) => mockCreateTask(...args),
  getTasks: (...args: any[]) => mockGetTasks(...args),
  getTaskById: (...args: any[]) => mockGetTaskById(...args),
  updateTask: (...args: any[]) => mockUpdateTask(...args),
  completeTask: (...args: any[]) => mockCompleteTask(...args),
  deleteTask: (...args: any[]) => mockDeleteTask(...args),
  getMyTasks: (...args: any[]) => mockGetMyTasks(...args),
  resetStore: jest.fn(),
}));

import tasksRoutes from '../src/routes/tasks';

describe('Tasks Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/tasks/my-tasks', () => {
    it('returns grouped tasks for current user', async () => {
      mockGetMyTasks.mockResolvedValue({
        overdue: [{ id: 't1', title: 'Overdue task' }],
        today: [],
        thisWeek: [],
        later: [],
      });
      const res = await request(app).get('/api/tasks/my-tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Fix NCR-2602-001', assigneeId: 'user-2', assigneeName: 'John', priority: 'HIGH' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ assigneeId: 'user-2', assigneeName: 'John' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('returns paginated tasks list', async () => {
      mockGetTasks.mockResolvedValue({ tasks: [{ id: 't1', title: 'Task 1' }], total: 1 });
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports filtering by status', async () => {
      const res = await request(app).get('/api/tasks?status=OPEN');
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('marks a task complete', async () => {
      const res = await request(app).patch('/api/tasks/t1/complete');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('updates task fields', async () => {
      const res = await request(app)
        .put('/api/tasks/t1')
        .send({ title: 'Updated title', status: 'IN_PROGRESS' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task', async () => {
      const res = await request(app).delete('/api/tasks/t1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
