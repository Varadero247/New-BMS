import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    approvalChain: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    approvalRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    approvalResponse: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    workflowStepApproval: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '@ims/database';
import approvalsRoutes from '../src/routes/approvals';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflows Approvals API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/approvals', approvalsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // APPROVAL CHAINS
  // ============================================

  describe('GET /api/approvals/chains', () => {
    const mockChains = [
      {
        id: 'chain-1',
        name: 'Standard Approval',
        chainType: 'SEQUENTIAL',
        isActive: true,
        levels: [{ level: 1, approverRole: 'MANAGER' }],
      },
      {
        id: 'chain-2',
        name: 'Parallel Approval',
        chainType: 'PARALLEL',
        isActive: true,
        levels: [{ level: 1, approverRole: 'MANAGER' }, { level: 1, approverRole: 'DIRECTOR' }],
      },
    ];

    it('should return list of approval chains', async () => {
      (mockPrisma.approvalChain.findMany as jest.Mock).mockResolvedValueOnce(mockChains);

      const response = await request(app).get('/api/approvals/chains');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by chainType', async () => {
      (mockPrisma.approvalChain.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/approvals/chains?chainType=SEQUENTIAL');

      expect(mockPrisma.approvalChain.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            chainType: 'SEQUENTIAL',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.approvalChain.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/approvals/chains?isActive=true');

      expect(mockPrisma.approvalChain.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalChain.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/approvals/chains');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/approvals/chains/:id', () => {
    it('should return single approval chain', async () => {
      (mockPrisma.approvalChain.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'chain-1',
        name: 'Standard Approval',
        chainType: 'SEQUENTIAL',
      });

      const response = await request(app).get('/api/approvals/chains/chain-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('chain-1');
    });

    it('should return 404 for non-existent chain', async () => {
      (mockPrisma.approvalChain.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/approvals/chains/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalChain.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/approvals/chains/chain-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/approvals/chains', () => {
    const createPayload = {
      name: 'New Chain',
      chainType: 'SEQUENTIAL' as const,
      levels: [{ level: 1, approverRole: 'MANAGER' }],
    };

    it('should create an approval chain successfully', async () => {
      (mockPrisma.approvalChain.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-chain-123',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/approvals/chains')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Chain');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/approvals/chains')
        .send({ chainType: 'SEQUENTIAL', levels: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid chainType', async () => {
      const response = await request(app)
        .post('/api/approvals/chains')
        .send({ ...createPayload, chainType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalChain.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/approvals/chains')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/approvals/chains/:id', () => {
    it('should update approval chain successfully', async () => {
      (mockPrisma.approvalChain.update as jest.Mock).mockResolvedValueOnce({
        id: 'chain-1',
        name: 'Updated Chain',
        chainType: 'PARALLEL',
      });

      const response = await request(app)
        .put('/api/approvals/chains/chain-1')
        .send({ name: 'Updated Chain', chainType: 'PARALLEL' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid chainType', async () => {
      const response = await request(app)
        .put('/api/approvals/chains/chain-1')
        .send({ chainType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalChain.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/approvals/chains/chain-1')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/approvals/chains/:id', () => {
    it('should delete approval chain successfully', async () => {
      (mockPrisma.approvalChain.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app).delete('/api/approvals/chains/chain-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalChain.delete as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).delete('/api/approvals/chains/chain-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // APPROVAL REQUESTS
  // ============================================

  describe('GET /api/approvals/requests', () => {
    const mockRequests = [
      {
        id: 'req-1',
        requestNumber: 'APR-001',
        title: 'Purchase Request',
        requestType: 'PURCHASE_REQUEST',
        status: 'PENDING',
        responses: [],
        _count: { responses: 0 },
      },
    ];

    it('should return list of approval requests', async () => {
      (mockPrisma.approvalRequest.findMany as jest.Mock).mockResolvedValueOnce(mockRequests);
      (mockPrisma.approvalRequest.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/approvals/requests');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      (mockPrisma.approvalRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvalRequest.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/approvals/requests?status=PENDING');

      expect(mockPrisma.approvalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should filter by requestType', async () => {
      (mockPrisma.approvalRequest.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvalRequest.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/approvals/requests?requestType=PURCHASE_REQUEST');

      expect(mockPrisma.approvalRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            requestType: 'PURCHASE_REQUEST',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalRequest.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/approvals/requests');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/approvals/requests/:id', () => {
    it('should return single approval request with responses', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        requestNumber: 'APR-001',
        title: 'Purchase Request',
        status: 'PENDING',
        responses: [],
      });

      const response = await request(app).get('/api/approvals/requests/req-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('req-1');
    });

    it('should return 404 for non-existent request', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/approvals/requests/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/approvals/requests/req-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/approvals/requests', () => {
    const createPayload = {
      title: 'New Purchase Request',
      requestType: 'PURCHASE_REQUEST' as const,
      requesterId: 'user-123',
    };

    it('should create approval request successfully', async () => {
      (mockPrisma.approvalRequest.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-req-123',
        requestNumber: 'APR-TEST',
        ...createPayload,
        status: 'PENDING',
      });

      const response = await request(app)
        .post('/api/approvals/requests')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Purchase Request');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/approvals/requests')
        .send({ requestType: 'PURCHASE_REQUEST', requesterId: 'user-123' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid requestType', async () => {
      const response = await request(app)
        .post('/api/approvals/requests')
        .send({ ...createPayload, requestType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing requesterId', async () => {
      const response = await request(app)
        .post('/api/approvals/requests')
        .send({ title: 'Test', requestType: 'PURCHASE_REQUEST' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalRequest.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/approvals/requests')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/approvals/requests/:id/respond', () => {
    const respondPayload = {
      approverId: 'approver-1',
      decision: 'APPROVE' as const,
      comments: 'Looks good',
    };

    it('should respond to approval request successfully', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        status: 'PENDING',
        currentLevel: 1,
        totalLevels: 1,
        outcome: null,
        decidedAt: null,
        responses: [],
      });
      (mockPrisma.approvalResponse.create as jest.Mock).mockResolvedValueOnce({
        id: 'resp-1',
        decision: 'APPROVE',
      });
      (mockPrisma.approvalRequest.update as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/approvals/requests/req-1/respond')
        .send(respondPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestStatus).toBe('APPROVED');
    });

    it('should return 404 for non-existent request', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/approvals/requests/non-existent/respond')
        .send(respondPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject response if request not pending', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        status: 'APPROVED',
        currentLevel: 1,
        totalLevels: 1,
        responses: [],
      });

      const response = await request(app)
        .put('/api/approvals/requests/req-1/respond')
        .send(respondPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });

    it('should reject if already responded at this level', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        status: 'PENDING',
        currentLevel: 1,
        totalLevels: 2,
        outcome: null,
        decidedAt: null,
        responses: [{ approverId: 'approver-1', level: 1 }],
      });

      const response = await request(app)
        .put('/api/approvals/requests/req-1/respond')
        .send(respondPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_RESPONDED');
    });

    it('should return 400 for invalid decision', async () => {
      const response = await request(app)
        .put('/api/approvals/requests/req-1/respond')
        .send({ ...respondPayload, decision: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalRequest.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/approvals/requests/req-1/respond')
        .send(respondPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/approvals/requests/:id/cancel', () => {
    it('should cancel approval request successfully', async () => {
      (mockPrisma.approvalRequest.update as jest.Mock).mockResolvedValueOnce({
        id: 'req-1',
        status: 'CANCELLED',
        outcome: 'CANCELLED',
      });

      const response = await request(app)
        .put('/api/approvals/requests/req-1/cancel')
        .send({ reason: 'No longer needed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.approvalRequest.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/approvals/requests/req-1/cancel')
        .send({ reason: 'Cancel' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // WORKFLOW STEP APPROVALS
  // ============================================

  describe('GET /api/approvals/step', () => {
    it('should return workflow step approvals', async () => {
      (mockPrisma.workflowStepApproval.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'step-1', status: 'PENDING', approverId: 'user-1' },
      ]);
      (mockPrisma.workflowStepApproval.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/approvals/step');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by approverId', async () => {
      (mockPrisma.workflowStepApproval.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.workflowStepApproval.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/approvals/step?approverId=user-1');

      expect(mockPrisma.workflowStepApproval.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            approverId: 'user-1',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowStepApproval.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/approvals/step');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/approvals/step/:id/respond', () => {
    it('should respond to step approval successfully', async () => {
      (mockPrisma.workflowStepApproval.update as jest.Mock).mockResolvedValueOnce({
        id: 'step-1',
        status: 'APPROVED',
        decision: 'APPROVE',
      });

      const response = await request(app)
        .put('/api/approvals/step/step-1/respond')
        .send({ decision: 'APPROVE', comments: 'OK' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid decision', async () => {
      const response = await request(app)
        .put('/api/approvals/step/step-1/respond')
        .send({ decision: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowStepApproval.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/approvals/step/step-1/respond')
        .send({ decision: 'APPROVE' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
