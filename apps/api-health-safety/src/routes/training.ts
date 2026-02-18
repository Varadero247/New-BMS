import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();
const STANDARD = 'ISO_45001';

router.use(authenticate);

// GET /api/training/courses - List H&S training courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await (prisma as any).trainingCourse.findMany({
      where: {
        OR: [{ standard: STANDARD }, { standard: null }],
        isActive: true,
      },
      orderBy: { title: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    logger.error('List training courses error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list training courses' } });
  }
});

// GET /api/training/records - List training records
router.get('/records', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, courseId, status } = req.query;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId as any;
    if (courseId) where.courseId = courseId as any;
    if (status) where.status = status as any;

    const records = await (prisma as any).trainingRecord.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, department: true } },
        course: { select: { id: true, title: true, standard: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Filter for H&S courses
    const hsRecords = records.filter(
      (r: any) => r.course.standard === STANDARD || r.course.standard === null
    );

    res.json({ success: true, data: hsRecords });
  } catch (error) {
    logger.error('List training records error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list training records' } });
  }
});

// POST /api/training/courses - Create H&S training course
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      provider: z.string().optional(),
      duration: z.string().optional(),
      frequency: z.string().optional(),
      requiredForRoles: z.string().optional(),
      requiredForDepartments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const course = await (prisma as any).trainingCourse.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        ...data,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create training course error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create training course' } });
  }
});

// POST /api/training/records - Create training record
router.post('/records', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      courseId: z.string(),
      completedAt: z.string().optional(),
      expiresAt: z.string().optional(),
      score: z.number().optional(),
      competenceLevel: z.enum(['AWARENESS', 'BASIC', 'PROFICIENT', 'EXPERT']).optional(),
      assessedBy: z.string().optional(),
      certificateUrl: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'FAILED']).default('NOT_STARTED'),
    });

    const data = schema.parse(req.body);

    const record = await (prisma as any).trainingRecord.create({
      data: {
        id: uuidv4(),
        ...data,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        assessedAt: data.assessedBy ? new Date() : null,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create training record error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create training record' } });
  }
});

export default router;
