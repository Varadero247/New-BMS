import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// ============================================
// SUPPLIER QUALIFICATION
// ============================================

// GET /api/suppliers/qualifications - List qualifications
router.get('/qualifications', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', supplierId, qualificationStatus } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (qualificationStatus) where.qualificationStatus = qualificationStatus;

    const [qualifications, total] = await Promise.all([
      prisma.supplierQualification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplierQualification.count({ where }),
    ]);

    res.json({
      success: true,
      data: qualifications,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List qualifications error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list qualifications' } });
  }
});

// POST /api/suppliers/qualifications - Create qualification
router.post('/qualifications', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      supplierId: z.string(),
      qualificationType: z.enum(['INITIAL', 'REQUALIFICATION', 'SCOPE_EXTENSION', 'CHANGE_ASSESSMENT']),
      productCategories: z.array(z.string()).default([]),
      services: z.array(z.string()).default([]),
      qualityScore: z.number().optional(),
      deliveryScore: z.number().optional(),
      technicalScore: z.number().optional(),
      financialScore: z.number().optional(),
      complianceScore: z.number().optional(),
      documentsReceived: z.any().optional(),
      certificationsVerified: z.any().optional(),
      conditions: z.array(z.string()).default([]),
      restrictions: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    // Generate qualification number
    const count = await prisma.supplierQualification.count();
    const qualificationNumber = `SQ-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    // Calculate overall score
    const scores = [data.qualityScore, data.deliveryScore, data.technicalScore, data.financialScore, data.complianceScore].filter(s => s !== undefined) as number[];
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;

    const qualification = await prisma.supplierQualification.create({
      data: {
        ...data,
        qualificationNumber,
        overallScore,
        qualificationStatus: 'PENDING',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: qualification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create qualification error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create qualification' } });
  }
});

// PATCH /api/suppliers/qualifications/:id - Update/approve qualification
router.patch('/qualifications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      qualificationStatus: z.enum(['PENDING', 'IN_PROGRESS', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED']).optional(),
      qualityScore: z.number().optional(),
      deliveryScore: z.number().optional(),
      technicalScore: z.number().optional(),
      financialScore: z.number().optional(),
      complianceScore: z.number().optional(),
      approvalNotes: z.string().optional(),
      validFrom: z.string().optional(),
      validUntil: z.string().optional(),
      conditions: z.array(z.string()).optional(),
      restrictions: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate overall score if any score changed
    const existing = await prisma.supplierQualification.findUnique({ where: { id: req.params.id } });
    const scores = [
      data.qualityScore ?? existing?.qualityScore,
      data.deliveryScore ?? existing?.deliveryScore,
      data.technicalScore ?? existing?.technicalScore,
      data.financialScore ?? existing?.financialScore,
      data.complianceScore ?? existing?.complianceScore,
    ].filter(s => s !== undefined && s !== null) as number[];
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;

    const qualification = await prisma.supplierQualification.update({
      where: { id: req.params.id },
      data: {
        ...data,
        overallScore,
        approvedById: data.qualificationStatus === 'APPROVED' ? req.user!.id : undefined,
        approvedAt: data.qualificationStatus === 'APPROVED' ? new Date() : undefined,
        assessedById: req.user!.id,
        assessmentDate: new Date(),
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
    });

    res.json({ success: true, data: qualification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update qualification error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update qualification' } });
  }
});

// ============================================
// SUPPLIER SCORECARDS
// ============================================

// GET /api/suppliers/:supplierId/scorecard - Get scorecards for supplier
router.get('/:supplierId/scorecard', async (req: AuthRequest, res: Response) => {
  try {
    const { periodType } = req.query;

    const where: any = { supplierId: req.params.supplierId };
    if (periodType) where.periodType = periodType;

    const scorecards = await prisma.supplierScorecard.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: 12, // Last 12 periods
    });

    res.json({ success: true, data: scorecards });
  } catch (error) {
    console.error('Get scorecards error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get scorecards' } });
  }
});

// POST /api/suppliers/:supplierId/scorecard - Create scorecard
router.post('/:supplierId/scorecard', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      periodType: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL']),
      periodStart: z.string(),
      periodEnd: z.string(),
      qualityPPM: z.number().optional(),
      qualityScore: z.number().optional(),
      ncCount: z.number().default(0),
      returnRate: z.number().optional(),
      onTimeDelivery: z.number().optional(),
      deliveryScore: z.number().optional(),
      lateDeliveries: z.number().default(0),
      costVariance: z.number().optional(),
      costScore: z.number().optional(),
      priceStability: z.number().optional(),
      responseTime: z.number().optional(),
      responsivenessScore: z.number().optional(),
      communicationScore: z.number().optional(),
      strengths: z.array(z.string()).default([]),
      improvements: z.array(z.string()).default([]),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate overall score (weighted average)
    const weights = { quality: 0.4, delivery: 0.3, cost: 0.2, responsiveness: 0.1 };
    const scores: { score: number; weight: number }[] = [];
    if (data.qualityScore) scores.push({ score: data.qualityScore, weight: weights.quality });
    if (data.deliveryScore) scores.push({ score: data.deliveryScore, weight: weights.delivery });
    if (data.costScore) scores.push({ score: data.costScore, weight: weights.cost });
    if (data.responsivenessScore) scores.push({ score: data.responsivenessScore, weight: weights.responsiveness });

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = totalWeight > 0
      ? scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
      : undefined;

    // Determine rating based on overall score
    let rating: 'PREFERRED' | 'APPROVED' | 'CONDITIONAL' | 'PROBATION' | 'DISQUALIFIED' | undefined;
    if (overallScore !== undefined) {
      if (overallScore >= 90) rating = 'PREFERRED';
      else if (overallScore >= 75) rating = 'APPROVED';
      else if (overallScore >= 60) rating = 'CONDITIONAL';
      else if (overallScore >= 40) rating = 'PROBATION';
      else rating = 'DISQUALIFIED';
    }

    const scorecard = await prisma.supplierScorecard.create({
      data: {
        ...data,
        supplierId: req.params.supplierId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        overallScore,
        rating,
      },
    });

    res.status(201).json({ success: true, data: scorecard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create scorecard error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create scorecard' } });
  }
});

// ============================================
// SUPPLIER AUDITS
// ============================================

// GET /api/suppliers/:supplierId/audits - List supplier audits
router.get('/:supplierId/audits', async (req: AuthRequest, res: Response) => {
  try {
    const audits = await prisma.supplierAudit.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { auditDate: 'desc' },
    });

    res.json({ success: true, data: audits });
  } catch (error) {
    console.error('List supplier audits error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list supplier audits' } });
  }
});

// POST /api/suppliers/:supplierId/audits - Create supplier audit
router.post('/:supplierId/audits', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      auditType: z.enum(['INITIAL', 'SURVEILLANCE', 'REQUALIFICATION', 'PROCESS', 'PRODUCT', 'SPECIAL']),
      auditDate: z.string(),
      location: z.string().optional(),
      scope: z.string(),
      standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
      clauses: z.array(z.string()).default([]),
      leadAuditorId: z.string().optional(),
      teamMembers: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    // Generate audit number
    const count = await prisma.supplierAudit.count();
    const auditNumber = `SA-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const audit = await prisma.supplierAudit.create({
      data: {
        ...data,
        supplierId: req.params.supplierId,
        auditNumber,
        auditDate: new Date(data.auditDate),
        status: 'SCHEDULED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create supplier audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier audit' } });
  }
});

// PATCH /api/suppliers/:supplierId/audits/:auditId - Update supplier audit
router.patch('/:supplierId/audits/:auditId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED']).optional(),
      overallRating: z.enum(['EXCELLENT', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY', 'NOT_RATED']).optional(),
      findings: z.any().optional(),
      majorNCs: z.number().optional(),
      minorNCs: z.number().optional(),
      observations: z.number().optional(),
      reportUrl: z.string().optional(),
      followUpRequired: z.boolean().optional(),
      followUpDate: z.string().optional(),
      followUpNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const audit = await prisma.supplierAudit.update({
      where: { id: req.params.auditId },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      },
    });

    res.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update supplier audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier audit' } });
  }
});

// ============================================
// SUPPLIER NCRs
// ============================================

// GET /api/suppliers/:supplierId/ncrs - List supplier NCRs
router.get('/:supplierId/ncrs', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = { supplierId: req.params.supplierId };
    if (status) where.status = status;

    const ncrs = await prisma.supplierNCR.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: ncrs });
  } catch (error) {
    console.error('List supplier NCRs error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list supplier NCRs' } });
  }
});

// POST /api/suppliers/:supplierId/ncrs - Create supplier NCR
router.post('/:supplierId/ncrs', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      issueType: z.enum(['QUALITY_DEFECT', 'DIMENSIONAL', 'MATERIAL', 'COSMETIC', 'DOCUMENTATION', 'PACKAGING', 'CONTAMINATION', 'WRONG_PART', 'SHORT_SHIPMENT', 'LATE_DELIVERY']),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).default('MINOR'),
      partNumber: z.string().optional(),
      poNumber: z.string().optional(),
      lotNumber: z.string().optional(),
      quantityReceived: z.number().optional(),
      quantityDefective: z.number().optional(),
      detectedAt: z.string().optional(),
      evidence: z.any().optional(),
      photos: z.any().optional(),
      containmentAction: z.string().optional(),
      eightDRequired: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Generate NCR number
    const count = await prisma.supplierNCR.count();
    const ncrNumber = `SNCR-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const ncr = await prisma.supplierNCR.create({
      data: {
        ...data,
        supplierId: req.params.supplierId,
        ncrNumber,
        detectedById: req.user!.id,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: ncr });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create supplier NCR error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier NCR' } });
  }
});

// PATCH /api/suppliers/:supplierId/ncrs/:ncrId - Update supplier NCR
router.patch('/:supplierId/ncrs/:ncrId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['OPEN', 'AWAITING_RESPONSE', 'RESPONSE_RECEIVED', 'UNDER_REVIEW', 'PENDING_VERIFICATION', 'CLOSED', 'ESCALATED']).optional(),
      supplierResponse: z.string().optional(),
      rootCauseProvided: z.string().optional(),
      correctiveActionProvided: z.string().optional(),
      eightDReceived: z.boolean().optional(),
      eightDAccepted: z.boolean().optional(),
      materialCost: z.number().optional(),
      laborCost: z.number().optional(),
      additionalCosts: z.number().optional(),
      chargedToSupplier: z.boolean().optional(),
      closureNotes: z.string().optional(),
      effectivenessVerified: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const ncr = await prisma.supplierNCR.update({
      where: { id: req.params.ncrId },
      data: {
        ...data,
        supplierResponseDate: data.supplierResponse ? new Date() : undefined,
        closedById: data.status === 'CLOSED' ? req.user!.id : undefined,
        closedAt: data.status === 'CLOSED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: ncr });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update supplier NCR error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier NCR' } });
  }
});

// ============================================
// PPAP SUBMISSIONS
// ============================================

// GET /api/ppap - List PPAP submissions
router.get('/ppap', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', supplierId, partNumber, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };
    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      prisma.pPAPSubmission.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pPAPSubmission.count({ where }),
    ]);

    res.json({
      success: true,
      data: submissions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List PPAP submissions error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list PPAP submissions' } });
  }
});

// POST /api/ppap - Create PPAP submission
router.post('/ppap', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      supplierId: z.string(),
      partNumber: z.string(),
      partName: z.string(),
      partRevision: z.string().optional(),
      submissionLevel: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5']),
      submissionReason: z.enum(['NEW_PART', 'ENGINEERING_CHANGE', 'TOOLING_CHANGE', 'PROCESS_CHANGE', 'LOCATION_CHANGE', 'SUBCONTRACTOR_CHANGE', 'REQUALIFICATION']),
      elements: z.any(), // Required elements
      requiredDate: z.string().optional(),
      attachments: z.any().optional(),
    });

    const data = schema.parse(req.body);

    // Generate submission number
    const count = await prisma.pPAPSubmission.count();
    const submissionNumber = `PPAP-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const submission = await prisma.pPAPSubmission.create({
      data: {
        ...data,
        submissionNumber,
        requiredDate: data.requiredDate ? new Date(data.requiredDate) : undefined,
        status: 'PENDING',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create PPAP submission error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PPAP submission' } });
  }
});

// PATCH /api/ppap/:id - Update PPAP submission
router.patch('/ppap/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      elements: z.any().optional(),
      submittedDate: z.string().optional(),
      status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'INTERIM_APPROVED', 'REJECTED', 'PENDING_RESUBMIT']).optional(),
      dispositionNotes: z.string().optional(),
      interimApproval: z.boolean().optional(),
      interimConditions: z.string().optional(),
      interimExpiryDate: z.string().optional(),
      attachments: z.any().optional(),
    });

    const data = schema.parse(req.body);

    const submission = await prisma.pPAPSubmission.update({
      where: { id: req.params.id },
      data: {
        ...data,
        submittedDate: data.submittedDate ? new Date(data.submittedDate) : undefined,
        reviewedById: data.status ? req.user!.id : undefined,
        reviewedAt: data.status ? new Date() : undefined,
        dispositionDate: data.status === 'APPROVED' || data.status === 'REJECTED' ? new Date() : undefined,
        dispositionById: data.status === 'APPROVED' || data.status === 'REJECTED' ? req.user!.id : undefined,
        interimExpiryDate: data.interimExpiryDate ? new Date(data.interimExpiryDate) : undefined,
      },
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update PPAP submission error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update PPAP submission' } });
  }
});

export default router;
