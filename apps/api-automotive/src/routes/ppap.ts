import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// PPAP 18 Elements (AIAG 4th Edition)
// ============================================

const PPAP_ELEMENTS = [
  { num: 1, name: 'Design Records' },
  { num: 2, name: 'Authorized Engineering Change Documents' },
  { num: 3, name: 'Customer Engineering Approval' },
  { num: 4, name: 'DFMEA' },
  { num: 5, name: 'Process Flow Diagram' },
  { num: 6, name: 'PFMEA' },
  { num: 7, name: 'Control Plan' },
  { num: 8, name: 'Measurement System Analysis' },
  { num: 9, name: 'Dimensional Results' },
  { num: 10, name: 'Material/Performance Test Results' },
  { num: 11, name: 'Initial Process Studies' },
  { num: 12, name: 'Qualified Lab Documentation' },
  { num: 13, name: 'Appearance Approval Report' },
  { num: 14, name: 'Sample Production Parts' },
  { num: 15, name: 'Master Sample' },
  { num: 16, name: 'Checking Aids' },
  { num: 17, name: 'Customer-Specific Requirements' },
  { num: 18, name: 'Part Submission Warrant' },
];

// Helper: generate PPAP reference number PPAP-YYMM-XXXX
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PPAP-${yy}${mm}`;

  const count = await prisma.ppapProject.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// Helper: generate PSW number PSW-YYMM-XXXX
async function generatePswNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PSW-${yy}${mm}`;

  const count = await prisma.ppapSubmission.count({
    where: { pswNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST / - Create PPAP project with auto-generated 18 elements
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200),
      partName: z.string().trim().min(1).max(200),
      customer: z.string().trim().min(1).max(200),
      submissionLevel: z.number().int().min(1).max(5).optional().default(3),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    // Create project with all 18 PPAP elements in a transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.ppapProject.create({
        data: {
          refNumber,
          partNumber: data.partNumber,
          partName: data.partName,
          customer: data.customer,
          submissionLevel: data.submissionLevel,
          status: 'DRAFT',
          createdBy: (req as AuthRequest).user?.id,
        },
      });

      // Create all 18 PPAP element records
      for (const element of PPAP_ELEMENTS) {
        await tx.ppapElement.create({
          data: {
            projectId: newProject.id,
            elementNumber: element.num,
            elementName: element.name,
            status: 'NOT_STARTED',
          },
        });
      }

      // Return the full project with elements
      return tx.ppapProject.findUnique({
        where: { id: newProject.id },
        include: {
          elements: { orderBy: { elementNumber: 'asc' } },
          submissions: true,
        },
      });
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create PPAP project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create PPAP project' },
    });
  }
});

// GET / - List PPAP projects
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, customer, partNumber } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (customer) where.customer = { contains: customer as string, mode: 'insensitive' };
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };

    const [projects, total] = await Promise.all([
      prisma.ppapProject.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.ppapProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List PPAP projects error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list PPAP projects' },
    });
  }
});

// GET /:id - Get PPAP project with elements and submissions
router.get('/:id', checkOwnership(prisma.ppapProject), async (req: Request, res: Response) => {
  try {
    const project = await prisma.ppapProject.findUnique({
      where: { id: req.params.id },
      include: {
        elements: { orderBy: { elementNumber: 'asc' } },
        submissions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP project not found' } });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Get PPAP project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get PPAP project' },
    });
  }
});

// PUT /:id/elements/:elementNumber - Update element status/docs
router.put('/:id/elements/:elementNumber', async (req: Request, res: Response) => {
  try {
    const { id, elementNumber: elemNumStr } = req.params;
    const elementNumber = parseInt(elemNumStr, 10);

    if (isNaN(elementNumber) || elementNumber < 1 || elementNumber > 18) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Element number must be between 1 and 18' },
      });
    }

    // Verify project exists
    const project = await prisma.ppapProject.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP project not found' } });
    }

    const schema = z.object({
      status: z
        .enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE', 'REJECTED'])
        .optional(),
      documentRef: z.string().trim().optional(),
      notes: z.string().trim().optional(),
      reviewedBy: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Find the element
    const element = await prisma.ppapElement.findFirst({
      where: { projectId: id, elementNumber },
    });

    if (!element) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP element not found' } });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.documentRef !== undefined) updateData.documentRef = data.documentRef;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.reviewedBy !== undefined) updateData.reviewedBy = data.reviewedBy;

    // Auto-set completedDate when status becomes COMPLETED
    if (data.status === 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    const updated = await prisma.ppapElement.update({
      where: { id: element.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update PPAP element error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update PPAP element' },
    });
  }
});

// POST /:id/psw - Submit Part Submission Warrant
router.post('/:id/psw', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify project exists
    const project = await prisma.ppapProject.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP project not found' } });
    }

    const schema = z.object({
      submissionLevel: z.number().int().min(1).max(5).optional(),
      customerNotes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const pswNumber = await generatePswNumber();

    const submission = await prisma.ppapSubmission.create({
      data: {
        projectId: id,
        pswNumber,
        submissionLevel: data.submissionLevel || project.submissionLevel,
        customerNotes: data.customerNotes,
        submittedBy: (req as AuthRequest).user?.id,
        submittedDate: new Date(),
        status: 'SUBMITTED',
      },
    });

    // Update project status to SUBMITTED
    await prisma.ppapProject.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Submit PSW error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit PSW' } });
  }
});

// GET /:id/readiness - PPAP readiness check
router.get('/:id/readiness', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.ppapProject.findUnique({
      where: { id },
      include: {
        elements: { orderBy: { elementNumber: 'asc' } },
      },
    });

    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP project not found' } });
    }

    const totalElements = project.elements.length;
    const completed = project.elements.filter((e) => e.status === 'COMPLETED').length;
    const notApplicable = project.elements.filter((e) => e.status === 'NOT_APPLICABLE').length;
    const ready = completed + notApplicable;
    const percentage = totalElements > 0 ? Math.round((ready / totalElements) * 100) : 0;
    const missingElements = project.elements
      .filter((e) => e.status !== 'COMPLETED' && e.status !== 'NOT_APPLICABLE')
      .map((e) => `${e.elementNumber}. ${e.elementName}`);

    res.json({
      success: true,
      data: {
        totalElements,
        completed,
        notApplicable,
        ready,
        percentage,
        missingElements,
      },
    });
  } catch (error) {
    logger.error('PPAP readiness check error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to check PPAP readiness' },
    });
  }
});

// POST /:id/submit-level - Set submission level (1-5)
router.post('/:id/submit-level', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.ppapProject.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'PPAP project not found' } });
    }

    const schema = z.object({
      level: z.number().int().min(1).max(5),
    });

    const data = schema.parse(req.body);

    const updated = await prisma.ppapProject.update({
      where: { id },
      data: { submissionLevel: data.level },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Set submission level error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to set submission level' },
    });
  }
});

export default router;
