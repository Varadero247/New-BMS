import express from 'express';
import request from 'supertest';

// Mock dependencies - routes import from ../prisma (re-exports from @ims/database/hr)
jest.mock('../src/prisma', () => {
  const p: any = {
    leaveType: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    leaveRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    leaveBalance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    leaveApproval: {
      updateMany: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    holiday: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  p.$transaction = jest.fn((cb: any) => cb(p));
  return { prisma: p };
});

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import leaveRoutes from '../src/routes/leave';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Leave API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/leave', leaveRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/leave/types', () => {
    const mockLeaveTypes = [
      {
        id: 'lt-1',
        code: 'AL',
        name: 'Annual Leave',
        category: 'ANNUAL',
        isActive: true,
        defaultDaysPerYear: 25,
        isPaid: true,
      },
      {
        id: 'lt-2',
        code: 'SL',
        name: 'Sick Leave',
        category: 'SICK',
        isActive: true,
        defaultDaysPerYear: 10,
        isPaid: true,
      },
    ];

    it('should return list of active leave types', async () => {
      (mockPrisma.leaveType.findMany as jest.Mock).mockResolvedValueOnce(mockLeaveTypes);

      const response = await request(app).get('/api/leave/types');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter only active leave types', async () => {
      (mockPrisma.leaveType.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/leave/types');

      expect(mockPrisma.leaveType.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        take: 100,
      });
    });

    it('should order by sortOrder ascending', async () => {
      (mockPrisma.leaveType.findMany as jest.Mock).mockResolvedValueOnce(mockLeaveTypes);

      await request(app).get('/api/leave/types');

      expect(mockPrisma.leaveType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveType.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/leave/types');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/leave/types', () => {
    const createPayload = {
      code: 'ML',
      name: 'Maternity Leave',
      category: 'MATERNITY',
      defaultDaysPerYear: 90,
      isPaid: true,
    };

    it('should create leave type successfully', async () => {
      (mockPrisma.leaveType.create as jest.Mock).mockResolvedValueOnce({
        id: 'lt-new',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/leave/types')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Maternity Leave');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/leave/types')
        .send({ name: 'Test', category: 'ANNUAL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/leave/types')
        .send({ code: 'TST', category: 'ANNUAL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/leave/types')
        .send({ code: 'TST', name: 'Test', category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveType.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/leave/types')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/leave/requests', () => {
    const mockRequests = [
      {
        id: '14100000-0000-4000-a000-000000000001',
        requestNumber: 'LR-2025-00001',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        leaveTypeId: 'lt-1',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        days: 5,
        status: 'PENDING',
        employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001', departmentId: '2b000000-0000-4000-a000-000000000001' },
        leaveType: { id: 'lt-1', name: 'Annual Leave' },
        approvals: [],
      },
    ];

    it('should return list of leave requests with pagination', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce(mockRequests);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/leave/requests');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app).get('/api/leave/requests?page=3&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/leave/requests?employeeId=2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            employeeId: '2a000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/leave/requests?status=PENDING');

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: 'PENDING',
          }),
        })
      );
    });

    it('should filter by leaveTypeId', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/leave/requests?leaveTypeId=lt-1');

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            leaveTypeId: 'lt-1',
          }),
        })
      );
    });

    it('should include employee, leaveType, and approvals', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValueOnce(mockRequests);
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/leave/requests');

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            employee: expect.any(Object),
            leaveType: true,
            approvals: true,
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveRequest.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/leave/requests');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/leave/requests/:id', () => {
    const mockRequest = {
      id: '14100000-0000-4000-a000-000000000001',
      requestNumber: 'LR-2025-00001',
      employeeId: '2a000000-0000-4000-a000-000000000001',
      days: 5,
      status: 'PENDING',
      employee: {
        id: '2a000000-0000-4000-a000-000000000001',
        firstName: 'John',
        lastName: 'Doe',
        employeeNumber: 'EMP001',
        department: { name: 'Engineering' },
        manager: { id: '53000000-0000-4000-a000-000000000001', firstName: 'Jane', lastName: 'Manager' },
      },
      leaveType: { id: 'lt-1', name: 'Annual Leave' },
      approvals: [],
    };

    it('should return single leave request', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce(mockRequest);

      const response = await request(app).get('/api/leave/requests/14100000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('14100000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff request', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/leave/requests/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/leave/requests/14100000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/leave/requests', () => {
    const createPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      leaveTypeId: '22222222-2222-2222-2222-222222222222',
      startDate: '2025-02-10',
      endDate: '2025-02-14',
      reason: 'Family vacation',
    };

    it('should create leave request successfully', async () => {
      (mockPrisma.leaveBalance.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'bal-1',
        balance: 25,
      });
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(10);
      (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValueOnce({
        managerId: '53000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.leaveRequest.create as jest.Mock).mockResolvedValueOnce({
        id: 'lr-new',
        requestNumber: 'LR-2025-00011',
        ...createPayload,
        days: 5,
        status: 'PENDING',
        employee: { firstName: 'John', lastName: 'Doe' },
        leaveType: { id: 'lt-1', name: 'Annual Leave' },
        approvals: [{ id: 'appr-1', approverEmployeeId: '53000000-0000-4000-a000-000000000001', status: 'PENDING' }],
      });
      (mockPrisma.leaveBalance.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/leave/requests')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should return 400 for insufficient balance', async () => {
      (mockPrisma.leaveBalance.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'bal-1',
        balance: 2,
      });

      const response = await request(app)
        .post('/api/leave/requests')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_BALANCE');
    });

    it('should return 400 for missing employeeId', async () => {
      const response = await request(app)
        .post('/api/leave/requests')
        .send({ leaveTypeId: '22222222-2222-2222-2222-222222222222', startDate: '2025-02-10', endDate: '2025-02-14' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing startDate', async () => {
      const response = await request(app)
        .post('/api/leave/requests')
        .send({ employeeId: '11111111-1111-1111-1111-111111111111', leaveTypeId: '22222222-2222-2222-2222-222222222222', endDate: '2025-02-14' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveBalance.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'bal-1',
        balance: 25,
      });
      (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValueOnce({
        managerId: null,
      });
      (mockPrisma.leaveRequest.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/leave/requests')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/leave/requests/:id/approve', () => {
    it('should approve leave request successfully', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '14100000-0000-4000-a000-000000000001',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        leaveTypeId: 'lt-1',
        startDate: new Date('2025-02-10'),
        days: 5,
        approvals: [],
      });
      (mockPrisma.leaveApproval.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (mockPrisma.leaveRequest.update as jest.Mock).mockResolvedValueOnce({
        id: '14100000-0000-4000-a000-000000000001',
        status: 'APPROVED',
        employee: { firstName: 'John', lastName: 'Doe' },
        leaveType: { name: 'Annual Leave' },
      });
      (mockPrisma.leaveBalance.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .put('/api/leave/requests/14100000-0000-4000-a000-000000000001/approve')
        .send({ approverId: '53000000-0000-4000-a000-000000000001', comments: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff request', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/leave/requests/00000000-0000-4000-a000-ffffffffffff/approve')
        .send({ approverId: '53000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/leave/requests/14100000-0000-4000-a000-000000000001/approve')
        .send({ approverId: '53000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/leave/requests/:id/reject', () => {
    it('should reject leave request successfully', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '14100000-0000-4000-a000-000000000001',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        leaveTypeId: 'lt-1',
        startDate: new Date('2025-02-10'),
        days: 5,
      });
      (mockPrisma.leaveApproval.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
      (mockPrisma.leaveRequest.update as jest.Mock).mockResolvedValueOnce({
        id: '14100000-0000-4000-a000-000000000001',
        status: 'REJECTED',
      });
      (mockPrisma.leaveBalance.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .put('/api/leave/requests/14100000-0000-4000-a000-000000000001/reject')
        .send({ approverId: '53000000-0000-4000-a000-000000000001', comments: 'Rejected - team busy' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff request', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/leave/requests/00000000-0000-4000-a000-ffffffffffff/reject')
        .send({ approverId: '53000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveRequest.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/leave/requests/14100000-0000-4000-a000-000000000001/reject')
        .send({ approverId: '53000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/leave/balances/:employeeId', () => {
    const mockBalances = [
      {
        id: 'bal-1',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        leaveTypeId: 'lt-1',
        year: 2025,
        entitled: 25,
        taken: 5,
        pending: 2,
        balance: 18,
        leaveType: { id: 'lt-1', name: 'Annual Leave' },
      },
    ];

    it('should return leave balances for employee', async () => {
      (mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValueOnce(mockBalances);

      const response = await request(app).get('/api/leave/balances/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by year', async () => {
      (mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/leave/balances/2a000000-0000-4000-a000-000000000001?year=2024');

      expect(mockPrisma.leaveBalance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            employeeId: '2a000000-0000-4000-a000-000000000001',
            year: 2024,
          }),
        })
      );
    });

    it('should include leaveType data', async () => {
      (mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValueOnce(mockBalances);

      await request(app).get('/api/leave/balances/2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.leaveBalance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { leaveType: true },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveBalance.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/leave/balances/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/leave/balances', () => {
    const balancePayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      leaveTypeId: '22222222-2222-2222-2222-222222222222',
      year: 2025,
      entitled: 25,
      carryForward: 3,
      adjustment: 0,
    };

    it('should upsert leave balance successfully', async () => {
      (mockPrisma.leaveBalance.upsert as jest.Mock).mockResolvedValueOnce({
        id: 'bal-1',
        ...balancePayload,
        balance: 28,
        leaveType: { name: 'Annual Leave' },
      });

      const response = await request(app)
        .post('/api/leave/balances')
        .send(balancePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should calculate balance from entitled + carryForward + adjustment', async () => {
      (mockPrisma.leaveBalance.upsert as jest.Mock).mockResolvedValueOnce({
        id: 'bal-1',
        balance: 28,
      });

      await request(app)
        .post('/api/leave/balances')
        .send(balancePayload);

      expect(mockPrisma.leaveBalance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            balance: 28,
          }),
          update: expect.objectContaining({
            balance: 28,
          }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/leave/balances')
        .send({ employeeId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.leaveBalance.upsert as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/leave/balances')
        .send(balancePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/leave/holidays', () => {
    const mockHolidays = [
      {
        id: 'hol-1',
        name: 'New Year',
        date: new Date('2025-01-01'),
        year: 2025,
        type: 'PUBLIC',
      },
    ];

    it('should return list of holidays', async () => {
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValueOnce(mockHolidays);

      const response = await request(app).get('/api/leave/holidays');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by year parameter', async () => {
      (mockPrisma.holiday.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/leave/holidays?year=2024');

      expect(mockPrisma.holiday.findMany).toHaveBeenCalledWith({
        where: { year: 2024, deletedAt: null },
        orderBy: { date: 'asc' },
        take: 100,
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.holiday.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/leave/holidays');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/leave/holidays', () => {
    const holidayPayload = {
      name: 'Independence Day',
      date: '2025-07-04',
      type: 'PUBLIC',
    };

    it('should create holiday successfully', async () => {
      (mockPrisma.holiday.create as jest.Mock).mockResolvedValueOnce({
        id: 'hol-new',
        ...holidayPayload,
        date: new Date(holidayPayload.date),
        year: 2025,
      });

      const response = await request(app)
        .post('/api/leave/holidays')
        .send(holidayPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Independence Day');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/leave/holidays')
        .send({ date: '2025-07-04', type: 'PUBLIC' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/leave/holidays')
        .send({ name: 'Test', date: '2025-07-04', type: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.holiday.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/leave/holidays')
        .send(holidayPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
