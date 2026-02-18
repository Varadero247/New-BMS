import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/training/courses - Get all courses
router.get('/courses', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { category, deliveryMethod, isMandatory } = req.query;

    const where: any = { isActive: true, deletedAt: null };
    if (category) where.category = category as any;
    if (deliveryMethod) where.deliveryMethod = deliveryMethod as any;
    if (isMandatory === 'true') where.isMandatory = true;

    const courses = await prisma.hRTrainingCourse.findMany({
      where,
      include: {
        _count: { select: { sessions: true, enrollments: true } },
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    logger.error('Error fetching courses', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch courses' } });
  }
});

// GET /api/training/courses/:id - Get single course
router.get('/courses/:id', checkOwnership(prisma.hRTrainingCourse), async (req: Request, res: Response) => {
  try {
    const course = await prisma.hRTrainingCourse.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          orderBy: { startDate: 'asc' },
          include: {
            _count: { select: { enrollments: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    logger.error('Error fetching course', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch course' } });
  }
});

// POST /api/training/courses - Create course
router.post('/courses', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      category: z.string(),
      provider: z.string().optional(),
      instructorName: z.string().optional(),
      deliveryMethod: z.enum(['CLASSROOM', 'VIRTUAL', 'E_LEARNING', 'ON_THE_JOB', 'SELF_PACED', 'BLENDED', 'WORKSHOP', 'SEMINAR']),
      duration: z.number().nonnegative(),
      maxParticipants: z.number().optional(),
      prerequisites: z.array(z.string()).default([]),
      objectives: z.string().optional(),
      syllabus: z.string().optional(),
      certificationAwarded: z.boolean().default(false),
      certificationValidity: z.number().optional(),
      costPerPerson: z.number().nonnegative().optional(),
      isMandatory: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    const course = await prisma.hRTrainingCourse.create({ data });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating course', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create course' } });
  }
});

// Sessions
// GET /api/training/sessions - Get training sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { courseId, status, startDate, endDate } = req.query;

    const where: any = { deletedAt: null };
    if (courseId) where.courseId = courseId as string;
    if (status) where.status = status as any;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    const sessions = await prisma.hRTrainingSession.findMany({
      where,
      include: {
        course: { select: { name: true, code: true, duration: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    logger.error('Error fetching sessions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sessions' } });
  }
});

// POST /api/training/sessions - Create session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      courseId: z.string().uuid(),
      startDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      endDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      location: z.string().optional(),
      isVirtual: z.boolean().default(false),
      meetingUrl: z.string().trim().url().optional(),
      instructorId: z.string().optional(),
      instructorName: z.string().optional(),
      maxParticipants: z.number(),
    });

    const data = schema.parse(req.body);

    // Generate session code
    const count = await prisma.hRTrainingSession.count({ where: { courseId: data.courseId } });
    const sessionCode = `${data.courseId.substring(0, 8)}-S${String(count + 1).padStart(3, '0')}`;

    const session = await prisma.hRTrainingSession.create({
      data: {
        sessionCode,
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'SCHEDULED',
      },
      include: { course: true },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating session', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } });
  }
});

// Enrollments
// GET /api/training/enrollments - Get enrollments
router.get('/enrollments', async (req: Request, res: Response) => {
  try {
    const { employeeId, courseId, sessionId, status } = req.query;

    const where: any = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId as string;
    if (courseId) where.courseId = courseId as string;
    if (sessionId) where.sessionId = sessionId as string;
    if (status) where.status = status as any;

    const enrollments = await prisma.hRTrainingEnrollment.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        course: { select: { name: true, code: true } },
        session: { select: { sessionCode: true, startDate: true, endDate: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: enrollments });
  } catch (error) {
    logger.error('Error fetching enrollments', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch enrollments' } });
  }
});

// POST /api/training/enrollments - Enroll employee
router.post('/enrollments', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      courseId: z.string().uuid(),
      sessionId: z.string().uuid().optional(),
    });

    const data = schema.parse(req.body);

    // Check if session has capacity
    if (data.sessionId) {
      const session = await prisma.hRTrainingSession.findUnique({
        where: { id: data.sessionId },
      });

      if (session && session.enrolledCount >= session.maxParticipants) {
        return res.status(400).json({
          success: false,
          error: { code: 'SESSION_FULL', message: 'Session is at full capacity' },
        });
      }
    }

    const enrollment = await prisma.hRTrainingEnrollment.create({
      data: {
        ...data,
        status: 'ENROLLED',
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
    });

    // Update session enrolled count
    if (data.sessionId) {
      await prisma.hRTrainingSession.update({
        where: { id: data.sessionId },
        data: { enrolledCount: { increment: 1 } },
      });
    }

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating enrollment', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create enrollment' } });
  }
});

// PUT /api/training/enrollments/:id - Update enrollment
router.put('/enrollments/:id', checkOwnership(prisma.hRTrainingEnrollment), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['ENROLLED', 'WAITLISTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'NO_SHOW']).optional(),
      attendancePercent: z.number().optional(),
      assessmentScore: z.number().nonnegative().optional(),
      passed: z.boolean().optional(),
      certificateUrl: z.string().trim().url('Invalid URL').optional(),
      feedbackRating: z.number().min(1).max(5).optional(),
      feedbackComments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = { ...data } as Record<string, unknown>;
    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    if (data.assessmentScore !== undefined) {
      updateData.assessmentDate = new Date();
    }

    const enrollment = await prisma.hRTrainingEnrollment.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: enrollment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating enrollment', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update enrollment' } });
  }
});

// Certifications
// GET /api/training/certifications - Get employee certifications
router.get('/certifications', async (req: Request, res: Response) => {
  try {
    const { employeeId, status, expiringWithin } = req.query;

    const where: any = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as any;
    if (expiringWithin) {
      const daysAhead = parseInt(expiringWithin as string, 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      where.expiryDate = { lte: futureDate, gte: new Date() };
      where.doesNotExpire = false;
    }

    const certifications = await prisma.employeeCertification.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
      orderBy: { expiryDate: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: certifications });
  } catch (error) {
    logger.error('Error fetching certifications', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch certifications' } });
  }
});

// POST /api/training/certifications - Add certification
router.post('/certifications', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      name: z.string().trim().min(1).max(200),
      issuingOrganization: z.string(),
      credentialId: z.string().optional(),
      credentialUrl: z.string().trim().url().optional(),
      issueDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      expiryDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      doesNotExpire: z.boolean().default(false),
      renewalRequired: z.boolean().default(false),
      certificateUrl: z.string().trim().url('Invalid URL').optional(),
    });

    const data = schema.parse(req.body);

    const certification = await prisma.employeeCertification.create({
      data: {
        ...data,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        status: 'ACTIVE',
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    res.status(201).json({ success: true, data: certification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating certification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create certification' } });
  }
});

// Training stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCourses,
      sessionsByStatus,
      enrollmentsByStatus,
      completedThisMonth,
      expiringCertifications,
      scoreStats,
    ] = await Promise.all([
      prisma.hRTrainingCourse.count({ where: { isActive: true } }),
      prisma.hRTrainingSession.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.hRTrainingEnrollment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.hRTrainingEnrollment.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: firstOfMonth },
        },
      }),
      prisma.employeeCertification.count({
        where: {
          expiryDate: { lte: thirtyDaysLater, gte: now },
          status: 'ACTIVE',
        },
      }),
      prisma.hRTrainingEnrollment.aggregate({
        _avg: { assessmentScore: true },
        where: { assessmentScore: { not: null } },
      }),
    ]);

    // Extract session counts by status
    const sessionCounts: Record<string, number> = {};
    sessionsByStatus.forEach(s => {
      sessionCounts[s.status] = s._count.id;
    });

    const scheduledSessions = sessionCounts['SCHEDULED'] || 0;
    const ongoingSessions = sessionCounts['IN_PROGRESS'] || 0;
    const completedSessions = sessionCounts['COMPLETED'] || 0;
    const cancelledSessions = sessionCounts['CANCELLED'] || 0;

    // Extract enrollment counts by status
    const enrollmentCounts: Record<string, number> = {};
    enrollmentsByStatus.forEach(e => {
      enrollmentCounts[e.status] = e._count.id;
    });

    const totalEnrollments = enrollmentsByStatus.reduce((acc, e) => acc + e._count.id, 0);
    const activeEnrollments = (enrollmentCounts['ENROLLED'] || 0) + (enrollmentCounts['IN_PROGRESS'] || 0);
    const completedEnrollments = enrollmentCounts['COMPLETED'] || 0;
    const droppedEnrollments = enrollmentCounts['CANCELLED'] || 0;
    const failedEnrollments = enrollmentCounts['FAILED'] || 0;

    // Calculate completion rate
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10
      : 0;

    // Get upcoming courses (next 30 days)
    const upcomingCourses = await prisma.hRTrainingSession.findMany({
      where: {
        startDate: { gte: now, lte: thirtyDaysLater },
        status: 'SCHEDULED',
      },
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    // Get popular courses by enrollment count
    const popularCoursesRaw = await prisma.hRTrainingEnrollment.groupBy({
      by: ['courseId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const popularCourses = await Promise.all(
      popularCoursesRaw.map(async (course) => {
        const courseData = await prisma.hRTrainingCourse.findUnique({
          where: { id: course.courseId },
          select: { name: true, code: true },
        });
        return {
          title: courseData?.name || 'Unknown',
          code: courseData?.code || '',
          enrollments: course._count.id,
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalCourses,
        scheduledSessions,
        ongoingSessions,
        completedSessions,
        cancelledSessions,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        droppedEnrollments,
        failedEnrollments,
        completedThisMonth,
        completionRate,
        avgScore: Math.round(((scoreStats._avg?.assessmentScore || 0) as any || 0) * 10) / 10,
        expiringCertifications,
        upcomingCourses: upcomingCourses.map(c => ({
          id: c.id,
          title: c.course.name,
          code: c.course.code,
          startDate: c.startDate.toISOString(),
          enrollments: c._count.enrollments,
          maxSeats: c.maxParticipants,
        })),
        popularCourses,
      },
    });
  } catch (error) {
    logger.error('Error fetching training stats', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

export default router;
