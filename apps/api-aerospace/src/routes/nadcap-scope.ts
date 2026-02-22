import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// AS9100D 8.5.1.2 — Special Processes: Nadcap Commodity Code Scope Verification
// Ensures Nadcap certificates cover the specific commodity codes actually being performed,
// not just certificate existence

const nadcapScopeSchema = z.object({
  supplierName: z.string().trim().min(1),
  supplierCode: z.string().trim().optional(),
  nadcapCertRef: z.string().trim().min(1),
  certExpiryDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  issuedByPri: z.boolean().optional(),
  commodityCodes: z.array(z.string()).min(1),
  commodityCodesRequired: z.array(z.string()).min(1),
  processDescription: z.string().trim().min(1),
  auditBoard: z.string().trim().optional(),
  lastAuditDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  nextAuditDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  verifiedBy: z.string().trim().min(1),
  verificationDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  approvedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function checkScopeGaps(certified: string[], required: string[]): string[] {
  return required.filter((code) => !certified.includes(code));
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { supplierName, status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (supplierName) where.supplierName = supplierName;
    if (status) where.status = status;
    const [records, total] = await Promise.all([
      prisma.aeroNadcapScope.findMany({ where, skip, take: limit, orderBy: { verificationDate: 'desc' } }),
      prisma.aeroNadcapScope.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list Nadcap scope verifications', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list Nadcap scope verifications' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = nadcapScopeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const scopeGaps = checkScopeGaps(parsed.data.commodityCodes, parsed.data.commodityCodesRequired);
    const status = scopeGaps.length === 0 ? 'VERIFIED_COMPLIANT' : 'SCOPE_GAP_IDENTIFIED';
    const record = await prisma.aeroNadcapScope.create({
      data: {
        id: uuidv4(), ...parsed.data,
        certExpiryDate: new Date(parsed.data.certExpiryDate),
        verificationDate: new Date(parsed.data.verificationDate),
        lastAuditDate: parsed.data.lastAuditDate ? new Date(parsed.data.lastAuditDate) : undefined,
        nextAuditDate: parsed.data.nextAuditDate ? new Date(parsed.data.nextAuditDate) : undefined,
        scopeGaps,
        status,
      },
    });
    if (scopeGaps.length > 0) {
      logger.warn('Nadcap scope gap identified', { supplierName: parsed.data.supplierName, gaps: scopeGaps });
    }
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create Nadcap scope verification', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create scope verification' } });
  }
});

router.get('/gaps', async (_req: Request, res: Response) => {
  try {
    const gapRecords = await prisma.aeroNadcapScope.findMany({
      where: { deletedAt: null, status: 'SCOPE_GAP_IDENTIFIED' },
      orderBy: { certExpiryDate: 'asc' },
    });
    const today = new Date();
    const expiringSoon = await prisma.aeroNadcapScope.findMany({
      where: {
        deletedAt: null,
        certExpiryDate: { gte: today, lte: new Date(today.getTime() + 90 * 86400000) },
      },
      orderBy: { certExpiryDate: 'asc' },
    });
    res.json({ success: true, data: { scopeGaps: gapRecords, expiringSoon } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get gaps' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.aeroNadcapScope.findUnique({ where: { id: req.params.id } });
    if (!record || record.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get record' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroNadcapScope.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    const updateSchema = nadcapScopeSchema.partial().extend({
      status: z.enum(['VERIFIED_COMPLIANT', 'SCOPE_GAP_IDENTIFIED', 'UNDER_REVIEW', 'EXPIRED', 'SUSPENDED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { certExpiryDate, verificationDate, lastAuditDate, nextAuditDate, commodityCodes, commodityCodesRequired, ...rest } = parsed.data;
    // Recalculate scope gaps if codes changed
    const newCertCodes = commodityCodes ?? (existing.commodityCodes as string[]);
    const newRequiredCodes = commodityCodesRequired ?? (existing.commodityCodesRequired as string[]);
    const scopeGaps = checkScopeGaps(newCertCodes, newRequiredCodes);
    const updated = await prisma.aeroNadcapScope.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(commodityCodes ? { commodityCodes } : {}),
        ...(commodityCodesRequired ? { commodityCodesRequired } : {}),
        scopeGaps,
        ...(certExpiryDate ? { certExpiryDate: new Date(certExpiryDate) } : {}),
        ...(verificationDate ? { verificationDate: new Date(verificationDate) } : {}),
        ...(lastAuditDate ? { lastAuditDate: new Date(lastAuditDate) } : {}),
        ...(nextAuditDate ? { nextAuditDate: new Date(nextAuditDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } });
  }
});

export default router;
