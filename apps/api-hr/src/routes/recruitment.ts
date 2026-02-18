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

// GET /api/recruitment/jobs - Get job postings
router.get('/jobs', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { status, departmentId, isRemote, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (departmentId) where.departmentId = departmentId as string;
    if (isRemote === 'true') where.isRemote = true;

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: {
          department: { select: { name: true } },
          position: { select: { title: true } },
          _count: { select: { applicants: true, interviews: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching jobs', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch jobs' } });
  }
});

// GET /api/recruitment/jobs/:id - Get single job
router.get('/jobs/:id', checkOwnership(prisma.jobPosting), async (req: Request, res: Response) => {
  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        applicants: {
          include: {
            _count: { select: { interviews: true, evaluations: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { applicants: true, interviews: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    logger.error('Error fetching job', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch job' } });
  }
});

// POST /api/recruitment/jobs - Create job posting
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      departmentId: z.string().uuid(),
      positionId: z.string().uuid().optional(),
      description: z.string(),
      responsibilities: z.string(),
      requirements: z.string(),
      preferredSkills: z.string().optional(),
      benefits: z.string().optional(),
      employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN', 'CONSULTANT', 'FREELANCE']),
      experienceMin: z.number().optional(),
      experienceMax: z.number().optional(),
      educationLevel: z.string().optional(),
      location: z.string(),
      isRemote: z.boolean().default(false),
      remoteType: z.enum(['FULLY_REMOTE', 'HYBRID', 'OCCASIONAL']).optional(),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      showSalary: z.boolean().default(false),
      openings: z.number().default(1),
      closeDate: z.string().optional(),
      internalOnly: z.boolean().default(false),
      hiringManagerId: z.string().optional(),
      recruiterId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Generate job code
    const count = await prisma.jobPosting.count();
    const jobCode = `JOB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const job = await prisma.jobPosting.create({
      data: {
        jobCode,
        ...data,
        closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
        status: 'DRAFT',
      },
      include: { department: true },
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating job', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create job' } });
  }
});

// PUT /api/recruitment/jobs/:id - Update job
router.put('/jobs/:id', checkOwnership(prisma.jobPosting), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ON_HOLD', 'CLOSED', 'FILLED', 'CANCELLED']).optional(),
      publishDate: z.string().optional(),
      closeDate: z.string().optional(),
    }).passthrough();

    const data = schema.parse(req.body);

    const updateData = { ...data } as Record<string, unknown>;
    if (data.publishDate) updateData.publishDate = new Date(data.publishDate);
    if (data.closeDate) updateData.closeDate = new Date(data.closeDate);

    const job = await prisma.jobPosting.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating job', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update job' } });
  }
});

// Applicants
// GET /api/recruitment/applicants - Get applicants
router.get('/applicants', async (req: Request, res: Response) => {
  try {
    const { jobPostingId, status, stage, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (jobPostingId) where.jobPostingId = jobPostingId as string;
    if (status) where.status = status as any;
    if (stage) where.stage = stage as any;

    const [applicants, total] = await Promise.all([
      prisma.applicant.findMany({
        where,
        include: {
          jobPosting: { select: { title: true, jobCode: true } },
          _count: { select: { interviews: true, evaluations: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.applicant.count({ where }),
    ]);

    res.json({
      success: true,
      data: applicants,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching applicants', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch applicants' } });
  }
});

// GET /api/recruitment/applicants/:id - Get single applicant
router.get('/applicants/:id', checkOwnership(prisma.applicant), async (req: Request, res: Response) => {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        jobPosting: true,
        interviews: {
          include: { evaluations: true },
          orderBy: { scheduledAt: 'asc' },
        },
        evaluations: true,
      },
    });

    if (!applicant) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Applicant not found' } });
    }

    res.json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error fetching applicant', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch applicant' } });
  }
});

// POST /api/recruitment/applicants - Create applicant
router.post('/applicants', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      jobPostingId: z.string().uuid(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      linkedinUrl: z.string().url().optional(),
      coverLetter: z.string().optional(),
      resumeUrl: z.string().optional(),
      portfolioUrl: z.string().url().optional(),
      source: z.enum(['WEBSITE', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'REFERRAL', 'AGENCY', 'CAMPUS', 'INTERNAL', 'OTHER']),
      referredBy: z.string().optional(),
      currentCompany: z.string().optional(),
      currentTitle: z.string().optional(),
      yearsExperience: z.number().optional(),
      noticePeriod: z.number().optional(),
      expectedSalary: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Generate applicant number
    const count = await prisma.applicant.count();
    const applicantNumber = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const applicant = await prisma.applicant.create({
      data: {
        applicantNumber,
        ...data,
        status: 'NEW',
        stage: 'APPLICATION',
      },
      include: { jobPosting: { select: { title: true } } },
    });

    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating applicant', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create applicant' } });
  }
});

// PUT /api/recruitment/applicants/:id/status - Update applicant status
router.put('/applicants/:id/status', checkOwnership(prisma.applicant), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN']),
      stage: z.enum(['APPLICATION', 'SCREENING', 'PHONE_INTERVIEW', 'TECHNICAL_ROUND', 'HR_ROUND', 'FINAL_ROUND', 'OFFER', 'BACKGROUND_CHECK', 'ONBOARDING']).optional(),
      rejectionReason: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const applicant = await prisma.applicant.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: applicant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating applicant', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update applicant' } });
  }
});

// Interviews
// POST /api/recruitment/interviews - Schedule interview
router.post('/interviews', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      applicantId: z.string().uuid(),
      jobPostingId: z.string().uuid(),
      round: z.number().default(1),
      interviewType: z.enum(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'CASE_STUDY']),
      scheduledAt: z.string(),
      duration: z.number().default(60),
      location: z.string().optional(),
      meetingUrl: z.string().url().optional(),
      interviewerIds: z.array(z.string()),
      organizerId: z.string(),
      agenda: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const interview = await prisma.interview.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        status: 'SCHEDULED',
      },
      include: {
        applicant: { select: { firstName: true, lastName: true, email: true } },
        jobPosting: { select: { title: true } },
      },
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error scheduling interview', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to schedule interview' } });
  }
});

// PUT /api/recruitment/interviews/:id - Update interview
router.put('/interviews/:id', checkOwnership(prisma.interview), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
      scheduledAt: z.string().optional(),
      cancelledReason: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = { ...data } as Record<string, unknown>;
    if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);

    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: interview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating interview', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update interview' } });
  }
});

// POST /api/recruitment/interviews/:id/evaluate - Submit evaluation
router.post('/interviews/:id/evaluate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      evaluatorId: z.string(),
      overallRating: z.number().min(1).max(5),
      technicalRating: z.number().min(1).max(5).optional(),
      communicationRating: z.number().min(1).max(5).optional(),
      cultureFitRating: z.number().min(1).max(5).optional(),
      leadershipRating: z.number().min(1).max(5).optional(),
      strengths: z.string().optional(),
      concerns: z.string().optional(),
      additionalNotes: z.string().optional(),
      recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE', 'STRONG_NO_HIRE']),
      recommendedSalary: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      select: { applicantId: true },
    });

    if (!interview) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    }

    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        interviewId: req.params.id,
        applicantId: interview.applicantId,
        ...data,
      },
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error submitting evaluation', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit evaluation' } });
  }
});

// GET /api/recruitment/stats - Recruitment statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      openPositions,
      totalApplications,
      byStatus,
      bySource,
      byStage,
      hiredThisMonth,
    ] = await Promise.all([
      prisma.jobPosting.count({ where: { status: 'PUBLISHED' } }),
      prisma.applicant.count(),
      prisma.applicant.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.applicant.groupBy({
        by: ['source'],
        _count: { id: true },
      }),
      prisma.applicant.groupBy({
        by: ['stage'],
        _count: { id: true },
      }),
      prisma.applicant.count({
        where: {
          status: 'HIRED',
          updatedAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    // Extract individual status counts
    const statusCounts: Record<string, number> = {};
    byStatus.forEach(s => {
      statusCounts[s.status] = s._count.id;
    });

    const pendingReview = statusCounts['NEW'] || 0;
    const screening = statusCounts['SCREENING'] || 0;
    const shortlisted = statusCounts['SHORTLISTED'] || 0;
    const interviewing = statusCounts['INTERVIEWING'] || 0;
    const offered = statusCounts['OFFER'] || 0;
    const accepted = statusCounts['HIRED'] || 0;
    const rejected = statusCounts['REJECTED'] || 0;
    const withdrawn = statusCounts['WITHDRAWN'] || 0;

    // Get top positions by application count
    const topPositionsRaw = await prisma.applicant.groupBy({
      by: ['jobPostingId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Get job titles for top positions
    const topPositions = await Promise.all(
      topPositionsRaw.map(async (pos) => {
        const job = await prisma.jobPosting.findUnique({
          where: { id: pos.jobPostingId },
          select: { title: true, jobCode: true },
        });
        return {
          title: job?.title || 'Unknown',
          jobCode: job?.jobCode || '',
          applications: pos._count.id,
        };
      })
    );

    // Calculate conversion rate (hired / total applications)
    const conversionRate = totalApplications > 0
      ? Math.round((accepted / totalApplications) * 10000) / 100
      : 0;

    // Calculate average time to hire (for completed hires)
    const hiredApplicants = await prisma.applicant.findMany({
      where: { status: 'HIRED', deletedAt: null } as any,
      select: { createdAt: true, updatedAt: true },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });

    let avgTimeToHire = 0;
    if (hiredApplicants.length > 0) {
      const totalDays = hiredApplicants.reduce((acc, app) => {
        const days = Math.round((app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredApplicants.length);
    }

    res.json({
      success: true,
      data: {
        openPositions,
        totalApplications,
        pendingReview,
        screening,
        shortlisted,
        interviewed: interviewing,
        offered,
        accepted,
        rejected,
        withdrawn,
        hiredThisMonth,
        applicationsByStatus: byStatus.map(s => ({
          status: s.status,
          count: s._count.id,
        })),
        applicationsBySource: bySource.map(s => ({
          source: s.source,
          count: s._count.id,
        })),
        applicationsByStage: byStage.map(s => ({
          stage: s.stage,
          count: s._count.id,
        })),
        topPositions,
        avgTimeToHire,
        conversionRate,
      },
    });
  } catch (error) {
    logger.error('Error fetching stats', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

export default router;
