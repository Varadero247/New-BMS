import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.qualSupplier.count({
    where: { referenceNumber: { startsWith: `QMS-SUP-${year}` } },
  });
  return `QMS-SUP-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Calculate overall IMS score: Quality 50% + H&S 30% + Env 20%
function calculateOverallImsScore(
  qualityScore: number,
  hsAuditScore: number,
  envAuditScore: number
): number {
  return Math.round(qualityScore * 0.5 + hsAuditScore * 0.3 + envAuditScore * 0.2);
}

// Determine overall rating from IMS score
function getOverallRating(
  score: number
): 'PREFERRED' | 'APPROVED' | 'CONDITIONAL' | 'PROBATIONARY' | 'SUSPENDED' | 'DISQUALIFIED' {
  if (score >= 90) return 'PREFERRED';
  if (score >= 75) return 'APPROVED';
  if (score >= 60) return 'CONDITIONAL';
  if (score >= 40) return 'PROBATIONARY';
  if (score >= 20) return 'SUSPENDED';
  return 'DISQUALIFIED';
}

// Determine risk level from IMS score
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'LOW';
  if (score >= 50) return 'MEDIUM';
  if (score >= 25) return 'HIGH';
  return 'CRITICAL';
}

// ============================================
// SUPPLIER CRUD
// ============================================

// GET / — List suppliers (paginated)
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', approvedStatus, category, overallRating, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (approvedStatus) where.approvedStatus = approvedStatus as any;
    if (category) where.category = category as any;
    if (overallRating) where.overallRating = overallRating as any;
    if (search) where.supplierName = { contains: search as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.qualSupplier.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualSupplier.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List suppliers error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list suppliers' },
    });
  }
});

// GET /:id — Get single supplier
router.get('/:id', checkOwnership(prisma.qualSupplier), async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await prisma.qualSupplier.findUnique({
      where: { id: req.params.id },
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Get supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get supplier' },
    });
  }
});

// POST / — Create supplier
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      supplierName: z.string().trim().min(1).max(200),
      supplierCode: z.string().trim().optional(),
      category: z.enum([
        'MATERIALS',
        'SERVICES',
        'EQUIPMENT',
        'LABOUR',
        'SUBCONTRACT',
        'UTILITIES',
        'PROFESSIONAL_SERVICES',
        'OTHER',
      ]),
      countryOfOrigin: z.string().trim().optional(),
      primaryContact: z.string().trim().optional(),
      contactEmail: z.string().trim().email('Invalid email').optional(),
      contactPhone: z.string().trim().optional(),
      accountManager: z.string().trim().optional(),
      approvedStatus: z
        .enum([
          'APPROVED',
          'CONDITIONALLY_APPROVED',
          'PROBATIONARY',
          'SUSPENDED',
          'DISQUALIFIED',
          'PENDING_EVALUATION',
        ])
        .optional(),
      // Quality Assessment
      iso9001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      certificationBody: z.string().trim().optional(),
      certificateExpiry: z.string().trim().optional(),
      qmsEvidence: z.string().trim().optional(),
      onTimeDeliveryPct: z.number().optional(),
      qualityRejectPct: z.number().optional(),
      ncrsRaised: z.number().optional(),
      capaCompletionPct: z.number().optional(),
      qualityScore: z.number().min(0).max(100).optional(),
      qualityRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      // H&S Assessment
      iso45001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      riddorLtiRate: z.number().nonnegative().optional(),
      hsPolicyInPlace: z.boolean().optional(),
      methodStatements: z.boolean().optional(),
      hsAuditScore: z.number().min(0).max(100).optional(),
      hsComments: z.string().trim().optional(),
      hsRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      // Environmental Assessment
      iso14001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      envPolicyInPlace: z.boolean().optional(),
      carbonFootprintData: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      wasteManagementPlan: z.boolean().optional(),
      envIncidents: z.number().optional(),
      envAuditScore: z.number().min(0).max(100).optional(),
      envComments: z.string().trim().optional(),
      envRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      // Audit & Review
      lastAuditDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      nextAuditDue: z.string().trim().optional(),
      auditType: z.enum(['DESK', 'ON_SITE', 'REMOTE', 'THIRD_PARTY']).optional(),
      auditFindings: z.string().trim().optional(),
      openNcrs: z.number().optional(),
      correctiveActionsDue: z.string().trim().optional(),
      reviewFrequency: z
        .enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE'])
        .optional(),
      // AI
      aiAnalysis: z.string().trim().optional(),
      aiKeyRisks: z.string().trim().optional(),
      aiImprovementAreas: z.string().trim().optional(),
      aiApprovalRecommendation: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    // Auto-calculate IMS scores
    const qs = data.qualityScore ?? 0;
    const hs = data.hsAuditScore ?? 0;
    const es = data.envAuditScore ?? 0;
    const overallImsScore = calculateOverallImsScore(qs, hs, es);
    const overallRating = getOverallRating(overallImsScore);
    const riskLevel = getRiskLevel(overallImsScore);

    const supplier = await prisma.qualSupplier.create({
      data: {
        referenceNumber,
        supplierName: data.supplierName,
        supplierCode: data.supplierCode,
        category: data.category,
        countryOfOrigin: data.countryOfOrigin,
        primaryContact: data.primaryContact,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        accountManager: data.accountManager,
        approvedStatus: data.approvedStatus || 'PENDING_EVALUATION',
        iso9001Certified: data.iso9001Certified,
        certificationBody: data.certificationBody,
        certificateExpiry: data.certificateExpiry ? new Date(data.certificateExpiry) : undefined,
        qmsEvidence: data.qmsEvidence,
        onTimeDeliveryPct: data.onTimeDeliveryPct,
        qualityRejectPct: data.qualityRejectPct,
        ncrsRaised: data.ncrsRaised,
        capaCompletionPct: data.capaCompletionPct,
        qualityScore: data.qualityScore ?? 0,
        qualityRating: data.qualityRating,
        iso45001Certified: data.iso45001Certified,
        riddorLtiRate: data.riddorLtiRate,
        hsPolicyInPlace: data.hsPolicyInPlace,
        methodStatements: data.methodStatements,
        hsAuditScore: data.hsAuditScore ?? 0,
        hsComments: data.hsComments,
        hsRating: data.hsRating,
        iso14001Certified: data.iso14001Certified,
        envPolicyInPlace: data.envPolicyInPlace,
        carbonFootprintData: data.carbonFootprintData,
        wasteManagementPlan: data.wasteManagementPlan,
        envIncidents: data.envIncidents,
        envAuditScore: data.envAuditScore ?? 0,
        envComments: data.envComments,
        envRating: data.envRating,
        overallImsScore,
        overallRating,
        riskLevel,
        lastAuditDate: data.lastAuditDate ? new Date(data.lastAuditDate) : undefined,
        nextAuditDue: data.nextAuditDue ? new Date(data.nextAuditDue) : undefined,
        auditType: data.auditType,
        auditFindings: data.auditFindings,
        openNcrs: data.openNcrs,
        correctiveActionsDue: data.correctiveActionsDue
          ? new Date(data.correctiveActionsDue)
          : undefined,
        reviewFrequency: data.reviewFrequency,
        aiAnalysis: data.aiAnalysis,
        aiKeyRisks: data.aiKeyRisks,
        aiImprovementAreas: data.aiImprovementAreas,
        aiApprovalRecommendation: data.aiApprovalRecommendation,
        aiGenerated: data.aiGenerated,
      },
    });

    res.status(201).json({ success: true, data: supplier });
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
    logger.error('Create supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' },
    });
  }
});

// PUT /:id — Update supplier
router.put('/:id', checkOwnership(prisma.qualSupplier), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualSupplier.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    const schema = z.object({
      supplierName: z.string().trim().min(1).max(200).optional(),
      supplierCode: z.string().trim().optional(),
      category: z
        .enum([
          'MATERIALS',
          'SERVICES',
          'EQUIPMENT',
          'LABOUR',
          'SUBCONTRACT',
          'UTILITIES',
          'PROFESSIONAL_SERVICES',
          'OTHER',
        ])
        .optional(),
      countryOfOrigin: z.string().trim().optional(),
      primaryContact: z.string().trim().optional(),
      contactEmail: z.string().trim().email('Invalid email').optional(),
      contactPhone: z.string().trim().optional(),
      accountManager: z.string().trim().optional(),
      approvedStatus: z
        .enum([
          'APPROVED',
          'CONDITIONALLY_APPROVED',
          'PROBATIONARY',
          'SUSPENDED',
          'DISQUALIFIED',
          'PENDING_EVALUATION',
        ])
        .optional(),
      iso9001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      certificationBody: z.string().trim().optional(),
      certificateExpiry: z.string().trim().optional(),
      qmsEvidence: z.string().trim().optional(),
      onTimeDeliveryPct: z.number().optional(),
      qualityRejectPct: z.number().optional(),
      ncrsRaised: z.number().optional(),
      capaCompletionPct: z.number().optional(),
      qualityScore: z.number().min(0).max(100).optional(),
      qualityRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      iso45001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      riddorLtiRate: z.number().nonnegative().optional(),
      hsPolicyInPlace: z.boolean().optional(),
      methodStatements: z.boolean().optional(),
      hsAuditScore: z.number().min(0).max(100).optional(),
      hsComments: z.string().trim().optional(),
      hsRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      iso14001Certified: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      envPolicyInPlace: z.boolean().optional(),
      carbonFootprintData: z.enum(['YES', 'NO', 'IN_PROGRESS']).optional(),
      wasteManagementPlan: z.boolean().optional(),
      envIncidents: z.number().optional(),
      envAuditScore: z.number().min(0).max(100).optional(),
      envComments: z.string().trim().optional(),
      envRating: z
        .enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'POOR'])
        .optional(),
      lastAuditDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      nextAuditDue: z.string().trim().optional(),
      auditType: z.enum(['DESK', 'ON_SITE', 'REMOTE', 'THIRD_PARTY']).optional(),
      auditFindings: z.string().trim().optional(),
      openNcrs: z.number().optional(),
      correctiveActionsDue: z.string().trim().optional(),
      reviewFrequency: z
        .enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE'])
        .optional(),
      aiAnalysis: z.string().trim().optional(),
      aiKeyRisks: z.string().trim().optional(),
      aiImprovementAreas: z.string().trim().optional(),
      aiApprovalRecommendation: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate IMS scores with merged values
    const qs = data.qualityScore ?? existing.qualityScore;
    const hs = data.hsAuditScore ?? existing.hsAuditScore;
    const es = data.envAuditScore ?? existing.envAuditScore;
    const overallImsScore = calculateOverallImsScore(qs, hs, es);
    const overallRating = getOverallRating(overallImsScore);
    const riskLevel = getRiskLevel(overallImsScore);

    const supplier = await prisma.qualSupplier.update({
      where: { id: req.params.id },
      data: {
        ...data,
        overallImsScore,
        overallRating,
        riskLevel,
        certificateExpiry: data.certificateExpiry ? new Date(data.certificateExpiry) : undefined,
        lastAuditDate: data.lastAuditDate ? new Date(data.lastAuditDate) : undefined,
        nextAuditDue: data.nextAuditDue ? new Date(data.nextAuditDue) : undefined,
        correctiveActionsDue: data.correctiveActionsDue
          ? new Date(data.correctiveActionsDue)
          : undefined,
      },
    });

    res.json({ success: true, data: supplier });
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
    logger.error('Update supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' },
    });
  }
});

// DELETE /:id — Delete supplier
router.delete(
  '/:id',
  checkOwnership(prisma.qualSupplier),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualSupplier.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
      }

      await prisma.qualSupplier.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete supplier error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' },
      });
    }
  }
);

export default router;
