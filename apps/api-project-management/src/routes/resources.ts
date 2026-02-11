import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

// GET /api/resources - List resources by projectId
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string };

    const [resources, total] = await Promise.all([
      prisma.projectResource.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectResource.count({ where }),
    ]);

    res.json({
      success: true,
      data: resources,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List resources error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list resources' } });
  }
});

// POST /api/resources - Create resource
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      resourceType: z.enum(['HUMAN', 'EQUIPMENT', 'MATERIAL', 'FACILITY']),
      resourceId: z.string().optional(),
      resourceName: z.string().min(1),
      resourceRole: z.string().optional(),
      responsibility: z.enum(['RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED']).optional(),
      allocationPercentage: z.number().min(0).max(100).optional(),
      allocatedFrom: z.string(),
      allocatedTo: z.string(),
      costPerHour: z.number().optional(),
      totalAllocatedCost: z.number().optional(),
      plannedHours: z.number().optional(),
      status: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const resource = await prisma.projectResource.create({
      data: {
        projectId: data.projectId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceName: data.resourceName,
        resourceRole: data.resourceRole,
        responsibility: data.responsibility || 'RESPONSIBLE',
        allocationPercentage: data.allocationPercentage ?? 100,
        allocatedFrom: new Date(data.allocatedFrom),
        allocatedTo: new Date(data.allocatedTo),
        costPerHour: data.costPerHour,
        totalAllocatedCost: data.totalAllocatedCost,
        plannedHours: data.plannedHours,
        status: data.status || 'ASSIGNED',
      },
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/resources/:id - Update resource
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectResource.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }

    const data = req.body;
    const updateData: any = { ...data };

    if (data.allocatedFrom) updateData.allocatedFrom = new Date(data.allocatedFrom);
    if (data.allocatedTo) updateData.allocatedTo = new Date(data.allocatedTo);

    // Auto-calculate utilization
    if (data.actualHours !== undefined || data.plannedHours !== undefined) {
      const planned = data.plannedHours ?? existing.plannedHours;
      const actual = data.actualHours ?? existing.actualHours;
      if (planned && planned > 0) {
        updateData.utilization = parseFloat(((actual / planned) * 100).toFixed(2));
      }
    }

    const resource = await prisma.projectResource.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectResource.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }

    await prisma.projectResource.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Resource deleted successfully' } });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
