import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/dhf — list design history files grouped by project
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.designProject.findMany({
      where: { deletedAt: null },
      include: {
        historyFiles: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const data = projects.map((p) => ({
      id: p.id,
      product: p.deviceName,
      phase: p.currentStage?.toLowerCase() || 'design',
      completeness: Math.min(100, p.historyFiles.length * 10),
      documents: p.historyFiles.map((f) => ({
        id: f.id,
        docNumber: f.documentRef || `DHF-${f.id.slice(0, 6)}`,
        title: f.title,
        type: f.category?.toLowerCase().replace('_', '-') || 'design-input',
        version: f.version,
        status: 'approved',
        product: p.deviceName,
        author: f.uploadedBy || 'N/A',
        lastModified: f.updatedAt,
        approver: f.uploadedBy || 'N/A',
      })),
    }));

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching DHF records', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch DHF records' } });
  }
});

// POST /api/dhf — add DHF document to a project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, title, category, documentRef, version } = req.body;
    const user = req as unknown as AuthRequest;

    if (!projectId || !title) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId and title are required' } });
    }

    const file = await prisma.designHistoryFile.create({
      data: {
        projectId,
        title,
        category: category || 'DESIGN_INPUT',
        documentRef: documentRef || null,
        version: version || '1.0',
        uploadedBy: user?.user?.email || user?.user?.id || null,
      },
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    logger.error('Error creating DHF entry', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create DHF entry' } });
  }
});

export default router;
