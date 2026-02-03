import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// ============================================
// TRAINING COURSES
// ============================================

// GET /api/training/courses - List courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, category, type } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (type) where.type = type;

    const [courses, total] = await Promise.all([
      prisma.qMSTrainingCourse.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { title: 'asc' },
        include: {
          _count: { select: { sessions: true, records: true, requirements: true } },
        },
      }),
      prisma.qMSTrainingCourse.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List courses error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list courses' } });
  }
});

// GET /api/training/courses/:id - Get single course
router.get('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.qMSTrainingCourse.findUnique({
      where: { id: req.params.id },
      include: {
        requirements: true,
        sessions: { orderBy: { scheduledDate: 'desc' }, take: 10 },
        records: { take: 20 },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get course' } });
  }
});

// POST /api/training/courses - Create course
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['ONBOARDING', 'QUALITY_SYSTEM', 'SAFETY', 'TECHNICAL', 'COMPLIANCE', 'MANAGEMENT', 'SOFT_SKILLS', 'CERTIFICATION', 'REFRESHER']),
      type: z.enum(['REQUIRED', 'RECOMMENDED', 'OPTIONAL', 'JOB_SPECIFIC', 'DEVELOPMENT']),
      standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
      objectives: z.array(z.string()).default([]),
      content: z.any().optional(),
      materials: z.any().optional(),
      durationHours: z.number().optional(),
      durationDays: z.number().optional(),
      deliveryMethod: z.enum(['CLASSROOM', 'ONLINE', 'BLENDED', 'ON_THE_JOB', 'SELF_PACED', 'VIRTUAL_INSTRUCTOR_LED']),
      provider: z.string().optional(),
      location: z.string().optional(),
      prerequisites: z.array(z.string()).default([]),
      assessmentRequired: z.boolean().default(false),
      passingScore: z.number().optional(),
      validityPeriod: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Generate course code
    const prefix = data.category.substring(0, 3).toUpperCase();
    const count = await prisma.qMSTrainingCourse.count();
    const courseCode = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;

    const course = await prisma.qMSTrainingCourse.create({
      data: {
        ...data,
        courseCode,
        status: 'ACTIVE',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create course error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create course' } });
  }
});

// PATCH /api/training/courses/:id - Update course
router.patch('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      objectives: z.array(z.string()).optional(),
      content: z.any().optional(),
      materials: z.any().optional(),
      durationHours: z.number().optional(),
      provider: z.string().optional(),
      passingScore: z.number().optional(),
      validityPeriod: z.number().optional(),
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'RETIRED']).optional(),
      version: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const course = await prisma.qMSTrainingCourse.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update course error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update course' } });
  }
});

// ============================================
// TRAINING REQUIREMENTS (Competency Matrix)
// ============================================

// GET /api/training/requirements - List requirements
router.get('/requirements', async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, courseId } = req.query;

    const where: any = { isActive: true };
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (courseId) where.courseId = courseId;

    const requirements = await prisma.qMSTrainingRequirement.findMany({
      where,
      include: {
        course: { select: { id: true, courseCode: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: requirements });
  } catch (error) {
    console.error('List requirements error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list requirements' } });
  }
});

// POST /api/training/requirements - Create requirement
router.post('/requirements', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      targetType: z.enum(['ROLE', 'DEPARTMENT', 'USER', 'ALL_EMPLOYEES', 'NEW_HIRES']),
      targetId: z.string().optional(),
      targetDescription: z.string().optional(),
      courseId: z.string(),
      isMandatory: z.boolean().default(true),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      dueWithinDays: z.number().optional(),
      isRecurring: z.boolean().default(false),
      recurringInterval: z.number().optional(),
      rationale: z.string().optional(),
      regulatoryRef: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const requirement = await prisma.qMSTrainingRequirement.create({
      data: {
        ...data,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create requirement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create requirement' } });
  }
});

// ============================================
// TRAINING RECORDS
// ============================================

// GET /api/training/records - List records
router.get('/records', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', userId, courseId, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      prisma.qMSTrainingRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { id: true, courseCode: true, title: true } },
        },
      }),
      prisma.qMSTrainingRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: records,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List records error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list records' } });
  }
});

// GET /api/training/my-records - Get current user's training records
router.get('/my-records', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.qMSTrainingRecord.findMany({
      where: { userId: req.user!.id },
      include: {
        course: { select: { id: true, courseCode: true, title: true, category: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get my records error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get records' } });
  }
});

// POST /api/training/records - Create/enroll record
router.post('/records', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      courseId: z.string(),
      sessionId: z.string().optional(),
      trainingMethod: z.string().optional(),
      trainerId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Check if record already exists
    const existing = await prisma.qMSTrainingRecord.findUnique({
      where: { userId_courseId: { userId: data.userId, courseId: data.courseId } },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'Training record already exists' } });
    }

    const record = await prisma.qMSTrainingRecord.create({
      data: {
        ...data,
        status: 'NOT_STARTED',
      },
    });

    // Update session enrolled count if session provided
    if (data.sessionId) {
      await prisma.qMSTrainingSession.update({
        where: { id: data.sessionId },
        data: { enrolledCount: { increment: 1 } },
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create record error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create record' } });
  }
});

// PATCH /api/training/records/:id - Update record (complete, assess)
router.patch('/records/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED', 'WAIVED']).optional(),
      assessmentScore: z.number().optional(),
      assessmentPassed: z.boolean().optional(),
      competencyLevel: z.enum(['AWARENESS', 'BASIC', 'PROFICIENT', 'EXPERT']).optional(),
      competencyNotes: z.string().optional(),
      certificateNumber: z.string().optional(),
      certificateUrl: z.string().optional(),
      expiryDate: z.string().optional(),
      effectivenessRating: z.number().min(1).max(5).optional(),
      feedback: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const record = await prisma.qMSTrainingRecord.update({
      where: { id: req.params.id },
      data: {
        ...data,
        completedAt: data.status === 'COMPLETED' || data.status === 'PASSED' ? new Date() : undefined,
        assessedById: data.competencyLevel ? req.user!.id : undefined,
        assessmentDate: data.assessmentScore !== undefined ? new Date() : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    res.json({ success: true, data: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update record error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } });
  }
});

// ============================================
// TRAINING SESSIONS
// ============================================

// GET /api/training/sessions - List sessions
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', courseId, status, upcoming } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.scheduledDate = { gte: new Date() };
    }

    const [sessions, total] = await Promise.all([
      prisma.qMSTrainingSession.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledDate: 'asc' },
        include: {
          course: { select: { id: true, courseCode: true, title: true } },
        },
      }),
      prisma.qMSTrainingSession.count({ where }),
    ]);

    res.json({
      success: true,
      data: sessions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list sessions' } });
  }
});

// POST /api/training/sessions - Create session
router.post('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      courseId: z.string(),
      scheduledDate: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      virtualLink: z.string().optional(),
      trainerId: z.string().optional(),
      trainerName: z.string().optional(),
      maxParticipants: z.number().optional(),
      notes: z.string().optional(),
      materials: z.any().optional(),
    });

    const data = schema.parse(req.body);

    // Generate session number
    const count = await prisma.qMSTrainingSession.count();
    const sessionNumber = `SES-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const session = await prisma.qMSTrainingSession.create({
      data: {
        ...data,
        sessionNumber,
        scheduledDate: new Date(data.scheduledDate),
        status: 'SCHEDULED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create session error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } });
  }
});

// PATCH /api/training/sessions/:id - Update session
router.patch('/sessions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      scheduledDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      virtualLink: z.string().optional(),
      trainerId: z.string().optional(),
      trainerName: z.string().optional(),
      maxParticipants: z.number().optional(),
      attendedCount: z.number().optional(),
      status: z.enum(['SCHEDULED', 'OPEN_FOR_ENROLLMENT', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']).optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const session = await prisma.qMSTrainingSession.update({
      where: { id: req.params.id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
    });

    res.json({ success: true, data: session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update session error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update session' } });
  }
});

// ============================================
// COMPETENCY MATRIX
// ============================================

// GET /api/training/matrix - Get competency matrices
router.get('/matrix', async (req: AuthRequest, res: Response) => {
  try {
    const { roleId, roleName, department, status } = req.query;

    const where: any = {};
    if (roleId) where.roleId = roleId;
    if (roleName) where.roleName = { contains: roleName as string, mode: 'insensitive' };
    if (department) where.department = department;
    if (status) where.status = status;

    const matrices = await prisma.competencyMatrix.findMany({
      where,
      orderBy: { roleName: 'asc' },
    });

    res.json({ success: true, data: matrices });
  } catch (error) {
    console.error('Get matrices error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get matrices' } });
  }
});

// POST /api/training/matrix - Create competency matrix
router.post('/matrix', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      roleId: z.string().optional(),
      roleName: z.string().min(1),
      department: z.string().optional(),
      competencies: z.any(), // Array of competencies
      effectiveDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const matrix = await prisma.competencyMatrix.create({
      data: {
        ...data,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        status: 'ACTIVE',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: matrix });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create matrix error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create matrix' } });
  }
});

// PATCH /api/training/matrix/:id - Update matrix with gap analysis
router.patch('/matrix/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      competencies: z.any().optional(),
      gapAnalysis: z.any().optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED']).optional(),
    });

    const data = schema.parse(req.body);

    const matrix = await prisma.competencyMatrix.update({
      where: { id: req.params.id },
      data: {
        ...data,
        lastAssessedAt: data.gapAnalysis ? new Date() : undefined,
        assessedById: data.gapAnalysis ? req.user!.id : undefined,
      },
    });

    res.json({ success: true, data: matrix });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update matrix error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update matrix' } });
  }
});

export default router;
