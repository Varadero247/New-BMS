import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createCourseSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  provider: z.string().optional(),
  duration: z.string().optional(),
  frequency: z.string().optional(),
  requiredForRoles: z.string().optional(),
  requiredForDepartments: z.string().optional(),
});

const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const createRecordSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  completedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  score: z.number().min(0).max(100).optional(),
  competenceLevel: z.enum(['AWARENESS', 'BASIC', 'PROFICIENT', 'EXPERT']).optional(),
  certificateUrl: z.string().optional(),
  notes: z.string().optional(),
});

const updateRecordSchema = createRecordSchema.partial().extend({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'FAILED']).optional(),
  assessedBy: z.string().optional(),
});

// ===== COURSES =====

// GET /api/training/courses - List all courses
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const {
      standard,
      isActive,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.trainingCourse.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { title: 'asc' },
        include: {
          _count: {
            select: { trainingRecords: true },
          },
        },
      }),
      prisma.trainingCourse.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/training/courses/:id - Get single course
router.get('/courses/:id', authenticate, async (req, res, next) => {
  try {
    const course = await prisma.trainingCourse.findUnique({
      where: { id: req.params.id },
      include: {
        trainingRecords: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found' },
      });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
});

// POST /api/training/courses - Create new course
router.post('/courses', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(createCourseSchema), async (req, res, next) => {
  try {
    const course = await prisma.trainingCourse.create({
      data: req.body,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'TrainingCourse',
        entityId: course.id,
        newData: course as any,
      },
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
});

// PUT /api/training/courses/:id - Update course
router.put('/courses/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(updateCourseSchema), async (req, res, next) => {
  try {
    const existing = await prisma.trainingCourse.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found' },
      });
    }

    const course = await prisma.trainingCourse.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'TrainingCourse',
        entityId: course.id,
        oldData: existing as any,
        newData: course as any,
      },
    });

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/training/courses/:id - Delete course
router.delete('/courses/:id', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const existing = await prisma.trainingCourse.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found' },
      });
    }

    await prisma.trainingCourse.delete({
      where: { id: req.params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'TrainingCourse',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Course deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

// ===== TRAINING RECORDS =====

// GET /api/training/records - List all training records
router.get('/records', authenticate, async (req, res, next) => {
  try {
    const {
      userId,
      courseId,
      status,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    // Check for expired records and update them
    await prisma.trainingRecord.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'COMPLETED',
      },
      data: { status: 'EXPIRED' },
    });

    const [records, total] = await Promise.all([
      prisma.trainingRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
          course: true,
        },
      }),
      prisma.trainingRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: records,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/training/matrix - Get training matrix
router.get('/matrix', authenticate, async (req, res, next) => {
  try {
    const { standard, department } = req.query;

    // Get all active courses
    const courseWhere: any = { isActive: true };
    if (standard) courseWhere.standard = standard;

    const courses = await prisma.trainingCourse.findMany({
      where: courseWhere,
      orderBy: { title: 'asc' },
    });

    // Get all users
    const userWhere: any = { isActive: true };
    if (department) userWhere.department = department;

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        role: true,
        trainingRecords: {
          where: { courseId: { in: courses.map((c) => c.id) } },
          select: {
            courseId: true,
            status: true,
            completedAt: true,
            expiresAt: true,
            competenceLevel: true,
          },
        },
      },
      orderBy: [{ department: 'asc' }, { lastName: 'asc' }],
    });

    // Build matrix
    const matrix = users.map((user) => {
      const recordMap = user.trainingRecords.reduce(
        (acc, record) => ({ ...acc, [record.courseId]: record }),
        {} as Record<string, any>
      );

      return {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          department: user.department,
          role: user.role,
        },
        training: courses.map((course) => ({
          courseId: course.id,
          courseTitle: course.title,
          ...recordMap[course.id],
        })),
      };
    });

    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      completionRate: 0,
      expiredCount: 0,
    };

    let totalRequired = 0;
    let totalCompleted = 0;
    users.forEach((user) => {
      courses.forEach((course) => {
        // Check if course is required for this user
        const requiredRoles = course.requiredForRoles?.split(',').map((r) => r.trim()) || [];
        const requiredDepts = course.requiredForDepartments?.split(',').map((d) => d.trim()) || [];

        const isRequired =
          requiredRoles.length === 0 && requiredDepts.length === 0 ||
          requiredRoles.includes(user.role) ||
          (user.department && requiredDepts.includes(user.department));

        if (isRequired) {
          totalRequired++;
          const record = user.trainingRecords.find((r) => r.courseId === course.id);
          if (record?.status === 'COMPLETED') totalCompleted++;
          if (record?.status === 'EXPIRED') stats.expiredCount++;
        }
      });
    });

    stats.completionRate = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100;

    res.json({
      success: true,
      data: { matrix, courses, stats },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/training/records - Create training record
router.post('/records', authenticate, validate(createRecordSchema), async (req, res, next) => {
  try {
    // Check for existing record
    const existing = await prisma.trainingRecord.findUnique({
      where: {
        userId_courseId: {
          userId: req.body.userId,
          courseId: req.body.courseId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Training record already exists for this user and course' },
      });
    }

    const status = req.body.completedAt ? 'COMPLETED' : 'NOT_STARTED';

    const record = await prisma.trainingRecord.create({
      data: {
        ...req.body,
        status,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        assessedAt: req.body.competenceLevel ? new Date() : undefined,
        assessedBy: req.body.competenceLevel ? req.user!.id : undefined,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: true,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

// PUT /api/training/records/:id - Update training record
router.put('/records/:id', authenticate, validate(updateRecordSchema), async (req, res, next) => {
  try {
    const existing = await prisma.trainingRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Training record not found' },
      });
    }

    const updateData: any = { ...req.body };
    if (req.body.completedAt) {
      updateData.completedAt = new Date(req.body.completedAt);
      updateData.status = 'COMPLETED';
    }
    if (req.body.expiresAt) updateData.expiresAt = new Date(req.body.expiresAt);
    if (req.body.competenceLevel) {
      updateData.assessedAt = new Date();
      updateData.assessedBy = req.user!.id;
    }

    const record = await prisma.trainingRecord.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: true,
      },
    });

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/training/records/:id - Delete training record
router.delete('/records/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const existing = await prisma.trainingRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Training record not found' },
      });
    }

    await prisma.trainingRecord.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, data: { message: 'Training record deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
