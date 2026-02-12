import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generators
// ============================================

async function generateBaselineRefNumber(): Promise<string> {
  const count = await prisma.configBaseline.count();
  return `CB-${String(count + 1).padStart(3, '0')}`;
}

async function generateECPRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.engineeringChangeProposal.count({
    where: { refNumber: { startsWith: `ECP-${yymm}` } },
  });
  return `ECP-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

async function generateAuditRefNumber(type: 'FCA' | 'PCA'): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = type;
  const count = await prisma.configAudit.count({
    where: { refNumber: { startsWith: `${prefix}-${yymm}` } },
  });
  return `${prefix}-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// BASELINES
// ============================================

// GET /baselines - List baselines
router.get('/baselines', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ConfigBaselineWhereInput = { deletedAt: null };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { program: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [baselines, total] = await Promise.all([
      prisma.configBaseline.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { id: true, partNumber: true, nomenclature: true, status: true } } },
      }),
      prisma.configBaseline.count({ where }),
    ]);

    res.json({
      success: true,
      data: baselines,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List baselines error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list baselines' } });
  }
});

// GET /baselines/:id - Get baseline with all config items
router.get('/baselines/:id', async (req: AuthRequest, res: Response) => {
  try {
    const baseline = await prisma.configBaseline.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!baseline || baseline.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    res.json({ success: true, data: baseline });
  } catch (error) {
    logger.error('Get baseline error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get baseline' } });
  }
});

// POST /baselines - Create baseline
router.post('/baselines', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      program: z.string().optional(),
      status: z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED']).optional(),
      effectiveDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateBaselineRefNumber();

    const baseline = await prisma.configBaseline.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        program: data.program,
        status: data.status || 'DRAFT',
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: baseline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create baseline error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create baseline' } });
  }
});

// PUT /baselines/:id - Update baseline
router.put('/baselines/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.configBaseline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      program: z.string().optional(),
      status: z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED']).optional(),
      effectiveDate: z.string().optional(),
      approvedBy: z.string().optional(),
      approvedDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const baseline = await prisma.configBaseline.update({
      where: { id: req.params.id },
      data: {
        ...data,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : existing.effectiveDate,
        approvedDate: data.approvedDate ? new Date(data.approvedDate) : existing.approvedDate,
      },
    });

    res.json({ success: true, data: baseline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update baseline error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update baseline' } });
  }
});

// DELETE /baselines/:id - Soft delete baseline
router.delete('/baselines/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.configBaseline.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    await prisma.configBaseline.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete baseline error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete baseline' } });
  }
});

// ============================================
// CONFIGURATION ITEMS
// ============================================

// POST /items - Add configuration item to a baseline
router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      baselineId: z.string().min(1, 'Baseline ID is required'),
      partNumber: z.string().min(1, 'Part number is required'),
      nomenclature: z.string().min(1, 'Nomenclature is required'),
      revision: z.string().min(1, 'Revision is required'),
      category: z.enum(['HARDWARE', 'SOFTWARE', 'FIRMWARE', 'DOCUMENT', 'TOOL', 'TEST_EQUIPMENT', 'MATERIAL']),
      serialNumber: z.string().optional(),
      lotNumber: z.string().optional(),
      status: z.enum(['CURRENT', 'SUPERSEDED', 'OBSOLETE', 'PENDING_CHANGE']).optional(),
      documentRef: z.string().optional(),
      specifications: z.string().optional(),
      supplier: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Verify baseline exists
    const baseline = await prisma.configBaseline.findUnique({ where: { id: data.baselineId } });
    if (!baseline || baseline.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const item = await prisma.configItem.create({
      data: {
        baselineId: data.baselineId,
        partNumber: data.partNumber,
        nomenclature: data.nomenclature,
        revision: data.revision,
        category: data.category,
        serialNumber: data.serialNumber,
        lotNumber: data.lotNumber,
        status: data.status || 'CURRENT',
        documentRef: data.documentRef,
        specifications: data.specifications,
        supplier: data.supplier,
        notes: data.notes,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create config item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create configuration item' } });
  }
});

// PUT /items/:id - Update configuration item
router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.configItem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Configuration item not found' } });
    }

    const schema = z.object({
      partNumber: z.string().min(1).optional(),
      nomenclature: z.string().min(1).optional(),
      revision: z.string().min(1).optional(),
      category: z.enum(['HARDWARE', 'SOFTWARE', 'FIRMWARE', 'DOCUMENT', 'TOOL', 'TEST_EQUIPMENT', 'MATERIAL']).optional(),
      serialNumber: z.string().optional(),
      lotNumber: z.string().optional(),
      status: z.enum(['CURRENT', 'SUPERSEDED', 'OBSOLETE', 'PENDING_CHANGE']).optional(),
      documentRef: z.string().optional(),
      specifications: z.string().optional(),
      supplier: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const item = await prisma.configItem.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update config item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update configuration item' } });
  }
});

// ============================================
// ENGINEERING CHANGE PROPOSALS
// ============================================

// POST /changes - Submit Engineering Change Proposal
router.post('/changes', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      reason: z.string().min(1, 'Reason is required'),
      urgency: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE']).optional(),
      affectedItems: z.array(z.string()).min(1, 'At least one affected item is required'),
      affectedBaselines: z.array(z.string()).optional().default([]),
      proposedBy: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateECPRefNumber();

    const ecp = await prisma.engineeringChangeProposal.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        reason: data.reason,
        urgency: data.urgency || 'ROUTINE',
        affectedItems: data.affectedItems,
        affectedBaselines: data.affectedBaselines,
        proposedBy: data.proposedBy || req.user?.id || 'unknown',
        status: 'PROPOSED',
      },
    });

    res.status(201).json({ success: true, data: ecp });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create ECP error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create engineering change proposal' } });
  }
});

// GET /changes - List ECPs
router.get('/changes', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, urgency, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EngineeringChangeProposalWhereInput = { deletedAt: null };
    if (status) where.status = status as any;
    if (urgency) where.urgency = urgency as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [ecps, total] = await Promise.all([
      prisma.engineeringChangeProposal.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ urgency: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.engineeringChangeProposal.count({ where }),
    ]);

    res.json({
      success: true,
      data: ecps,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List ECPs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list engineering change proposals' } });
  }
});

// PUT /changes/:id/approve - CCB approval
router.put('/changes/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.engineeringChangeProposal.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Engineering change proposal not found' } });
    }

    const schema = z.object({
      ccbDecision: z.enum(['APPROVE', 'APPROVE_WITH_CONDITIONS', 'REJECT', 'DEFER', 'MORE_INFO_NEEDED']),
      ccbMembers: z.array(z.string()).min(1, 'At least one CCB member is required'),
      ccbNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Determine new status based on CCB decision
    let newStatus: string;
    switch (data.ccbDecision) {
      case 'APPROVE':
      case 'APPROVE_WITH_CONDITIONS':
        newStatus = 'CCB_APPROVED';
        break;
      case 'REJECT':
        newStatus = 'CCB_REJECTED';
        break;
      case 'DEFER':
      case 'MORE_INFO_NEEDED':
        newStatus = 'UNDER_REVIEW';
        break;
      default:
        newStatus = existing.status;
    }

    const ecp = await prisma.engineeringChangeProposal.update({
      where: { id: req.params.id },
      data: {
        ccbDecision: data.ccbDecision as any,
        ccbDate: new Date(),
        ccbMembers: data.ccbMembers,
        ccbNotes: data.ccbNotes,
        status: newStatus as any,
      },
    });

    res.json({ success: true, data: ecp });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Approve ECP error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve engineering change proposal' } });
  }
});

// ============================================
// CONFIGURATION AUDITS (FCA / PCA)
// ============================================

// POST /audits/fca - Create Functional Configuration Audit
router.post('/audits/fca', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      baselineId: z.string().min(1, 'Baseline ID is required'),
      auditDate: z.string().min(1, 'Audit date is required'),
      auditors: z.array(z.string()).min(1, 'At least one auditor is required'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateAuditRefNumber('FCA');

    // Verify baseline exists
    const baseline = await prisma.configBaseline.findUnique({ where: { id: data.baselineId } });
    if (!baseline || baseline.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const audit = await prisma.configAudit.create({
      data: {
        refNumber,
        type: 'FCA',
        title: data.title,
        baselineId: data.baselineId,
        auditDate: new Date(data.auditDate),
        auditors: data.auditors,
        status: 'PLANNED',
        notes: data.notes,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create FCA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create FCA' } });
  }
});

// POST /audits/pca - Create Physical Configuration Audit
router.post('/audits/pca', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      baselineId: z.string().min(1, 'Baseline ID is required'),
      auditDate: z.string().min(1, 'Audit date is required'),
      auditors: z.array(z.string()).min(1, 'At least one auditor is required'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateAuditRefNumber('PCA');

    // Verify baseline exists
    const baseline = await prisma.configBaseline.findUnique({ where: { id: data.baselineId } });
    if (!baseline || baseline.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const audit = await prisma.configAudit.create({
      data: {
        refNumber,
        type: 'PCA',
        title: data.title,
        baselineId: data.baselineId,
        auditDate: new Date(data.auditDate),
        auditors: data.auditors,
        status: 'PLANNED',
        notes: data.notes,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create PCA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PCA' } });
  }
});

// GET /audits - List configuration audits
router.get('/audits', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', type, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ConfigAuditWhereInput = { deletedAt: null };
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [audits, total] = await Promise.all([
      prisma.configAudit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { auditDate: 'desc' },
      }),
      prisma.configAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List audits error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list configuration audits' } });
  }
});

// ============================================
// STATUS ACCOUNTING
// ============================================

// GET /status-accounting - Full Configuration Status Accounting report
router.get('/status-accounting', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalBaselines,
      activeBaselines,
      draftBaselines,
      supersededBaselines,
      archivedBaselines,
      totalItems,
      currentItems,
      pendingChangeItems,
      supersededItems,
      obsoleteItems,
      totalECPs,
      proposedECPs,
      underReviewECPs,
      approvedECPs,
      rejectedECPs,
      implementingECPs,
      implementedECPs,
      verifiedECPs,
      closedECPs,
      totalAudits,
      plannedAudits,
      completedAudits,
      fcaCount,
      pcaCount,
      passAudits,
      passWithFindingsAudits,
      failAudits,
    ] = await Promise.all([
      prisma.configBaseline.count({ where: { deletedAt: null } }),
      prisma.configBaseline.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.configBaseline.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      prisma.configBaseline.count({ where: { deletedAt: null, status: 'SUPERSEDED' } }),
      prisma.configBaseline.count({ where: { deletedAt: null, status: 'ARCHIVED' } }),
      prisma.configItem.count(),
      prisma.configItem.count({ where: { status: 'CURRENT' } }),
      prisma.configItem.count({ where: { status: 'PENDING_CHANGE' } }),
      prisma.configItem.count({ where: { status: 'SUPERSEDED' } }),
      prisma.configItem.count({ where: { status: 'OBSOLETE' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'PROPOSED' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'UNDER_REVIEW' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'CCB_APPROVED' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'CCB_REJECTED' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'IMPLEMENTING' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'IMPLEMENTED' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'VERIFIED' } }),
      prisma.engineeringChangeProposal.count({ where: { deletedAt: null, status: 'CLOSED' } }),
      prisma.configAudit.count({ where: { deletedAt: null } }),
      prisma.configAudit.count({ where: { deletedAt: null, status: 'PLANNED' } }),
      prisma.configAudit.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      prisma.configAudit.count({ where: { deletedAt: null, type: 'FCA' } }),
      prisma.configAudit.count({ where: { deletedAt: null, type: 'PCA' } }),
      prisma.configAudit.count({ where: { deletedAt: null, result: 'PASS' } }),
      prisma.configAudit.count({ where: { deletedAt: null, result: 'PASS_WITH_FINDINGS' } }),
      prisma.configAudit.count({ where: { deletedAt: null, result: 'FAIL' } }),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      baselines: {
        total: totalBaselines,
        byStatus: {
          active: activeBaselines,
          draft: draftBaselines,
          superseded: supersededBaselines,
          archived: archivedBaselines,
        },
      },
      configurationItems: {
        total: totalItems,
        byStatus: {
          current: currentItems,
          pendingChange: pendingChangeItems,
          superseded: supersededItems,
          obsolete: obsoleteItems,
        },
      },
      engineeringChangeProposals: {
        total: totalECPs,
        byStatus: {
          proposed: proposedECPs,
          underReview: underReviewECPs,
          ccbApproved: approvedECPs,
          ccbRejected: rejectedECPs,
          implementing: implementingECPs,
          implemented: implementedECPs,
          verified: verifiedECPs,
          closed: closedECPs,
        },
        pendingActions: proposedECPs + underReviewECPs + implementingECPs,
      },
      audits: {
        total: totalAudits,
        byType: {
          fca: fcaCount,
          pca: pcaCount,
        },
        byStatus: {
          planned: plannedAudits,
          completed: completedAudits,
        },
        results: {
          pass: passAudits,
          passWithFindings: passWithFindingsAudits,
          fail: failAudits,
        },
      },
    };

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Status accounting error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate status accounting report' } });
  }
});

export default router;
