import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-infosec');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GDPR Gap Modules:
// Art 37–39 — Data Protection Officer (DPO)
// Art 28 — Data Processing Agreements (DPA)
// Art 46 — International Data Transfers
// Art 25 — Privacy by Design / DPIA
// Art 77 — Supervisory Authority Complaints

const dpoSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  phone: z.string().trim().optional(),
  isExternal: z.boolean().optional(),
  organisation: z.string().trim().optional(),
  appointmentDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  responsibilities: z.string().trim().optional(),
  publishedOnWebsite: z.boolean().optional(),
  notifiedToSa: z.boolean().optional(),
  saNotificationDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
});

const dpaSchema = z.object({
  processorName: z.string().trim().min(1),
  processorContact: z.string().trim().optional(),
  processingActivities: z.string().trim().min(1),
  dataCategories: z.array(z.string()).min(1),
  effectiveDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  expiryDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  subProcessorsAllowed: z.boolean().optional(),
  subProcessorList: z.string().trim().optional(),
  article28Compliant: z.boolean().optional(),
  documentRef: z.string().trim().optional(),
  createdBy: z.string().trim().min(1),
});

const transferSchema = z.object({
  recipientCountry: z.string().trim().min(1),
  recipientOrg: z.string().trim().min(1),
  transferMechanism: z.enum(['ADEQUACY_DECISION', 'STANDARD_CONTRACTUAL_CLAUSES', 'BINDING_CORPORATE_RULES', 'EXPLICIT_CONSENT', 'VITAL_INTERESTS', 'PUBLIC_INTEREST', 'LEGAL_CLAIMS', 'DEROGATION', 'OTHER']),
  dataCategories: z.array(z.string()).min(1),
  purpose: z.string().trim().min(1),
  documentRef: z.string().trim().optional(),
  validFrom: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  validUntil: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  createdBy: z.string().trim().min(1),
});

const privacyByDesignSchema = z.object({
  projectName: z.string().trim().min(1),
  projectDescription: z.string().trim().min(1),
  dpiaRequired: z.boolean().optional(),
  dpiaCompleted: z.boolean().optional(),
  dpiaDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  dpiaFindings: z.string().trim().optional(),
  dataMinimisation: z.boolean().optional(),
  pseudonymisation: z.boolean().optional(),
  encryptionApplied: z.boolean().optional(),
  accessControls: z.string().trim().optional(),
  retentionPeriod: z.string().trim().optional(),
  deletionMechanism: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  reviewDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  createdBy: z.string().trim().min(1),
});

const saComplaintSchema = z.object({
  complaintRef: z.string().trim().optional(),
  complainantType: z.enum(['DATA_SUBJECT', 'THIRD_PARTY', 'REGULATOR']),
  supervisoryAuthority: z.string().trim().min(1),
  receivedDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  subject: z.string().trim().min(1),
  description: z.string().trim().min(1),
  artCited: z.array(z.string()).optional(),
  responseDeadline: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  assignedTo: z.string().trim().optional(),
  createdBy: z.string().trim().min(1),
});

// ── DPO Management (Art 37–39) ────────────────────────────────────────────

router.get('/dpo', async (_req: Request, res: Response) => {
  try {
    const dpos = await prisma.isDpo.findMany({ where: { deletedAt: null }, orderBy: { appointmentDate: 'desc' } });
    res.json({ success: true, data: dpos });
  } catch (error: unknown) {
    logger.error('Failed to list DPOs', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list DPOs' } });
  }
});

router.post('/dpo', async (req: Request, res: Response) => {
  try {
    const parsed = dpoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const dpo = await prisma.isDpo.create({
      data: {
        id: uuidv4(), ...parsed.data,
        appointmentDate: new Date(parsed.data.appointmentDate),
        saNotificationDate: parsed.data.saNotificationDate ? new Date(parsed.data.saNotificationDate) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('DPO registered', { name: parsed.data.name });
    res.status(201).json({ success: true, data: dpo });
  } catch (error: unknown) {
    logger.error('Failed to register DPO', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register DPO' } });
  }
});

router.get('/dpo/:id', async (req: Request, res: Response) => {
  try {
    const dpo = await prisma.isDpo.findUnique({ where: { id: req.params.id } });
    if (!dpo || dpo.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DPO not found' } });
    res.json({ success: true, data: dpo });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get DPO' } });
  }
});

router.put('/dpo/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isDpo.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DPO not found' } });
    const updateSchema = dpoSchema.partial().extend({ status: z.enum(['ACTIVE', 'RESIGNED', 'REMOVED']).optional() });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { appointmentDate, saNotificationDate, ...rest } = parsed.data;
    const updated = await prisma.isDpo.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(appointmentDate ? { appointmentDate: new Date(appointmentDate) } : {}),
        ...(saNotificationDate ? { saNotificationDate: new Date(saNotificationDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update DPO' } });
  }
});

// ── Data Processing Agreements (Art 28) ───────────────────────────────────

router.get('/dpa', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [dpas, total] = await Promise.all([
      prisma.isDpa.findMany({ where, skip, take: limit, orderBy: { effectiveDate: 'desc' } }),
      prisma.isDpa.count({ where }),
    ]);
    res.json({ success: true, data: dpas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list DPAs' } });
  }
});

router.post('/dpa', async (req: Request, res: Response) => {
  try {
    const parsed = dpaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const dpa = await prisma.isDpa.create({
      data: {
        id: uuidv4(), ...parsed.data,
        effectiveDate: new Date(parsed.data.effectiveDate),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('DPA created', { processorName: parsed.data.processorName });
    res.status(201).json({ success: true, data: dpa });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create DPA' } });
  }
});

router.get('/dpa/:id', async (req: Request, res: Response) => {
  try {
    const dpa = await prisma.isDpa.findUnique({ where: { id: req.params.id } });
    if (!dpa || dpa.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DPA not found' } });
    res.json({ success: true, data: dpa });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get DPA' } });
  }
});

// ── International Transfers (Art 46) ──────────────────────────────────────

router.get('/transfers', async (req: Request, res: Response) => {
  try {
    const { transferMechanism } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (transferMechanism) where.transferMechanism = transferMechanism;
    const [transfers, total] = await Promise.all([
      prisma.isInternationalTransfer.findMany({ where, skip, take: limit, orderBy: { validFrom: 'desc' } }),
      prisma.isInternationalTransfer.count({ where }),
    ]);
    res.json({ success: true, data: transfers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list transfers' } });
  }
});

router.post('/transfers', async (req: Request, res: Response) => {
  try {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const transfer = await prisma.isInternationalTransfer.create({
      data: {
        id: uuidv4(), ...parsed.data,
        validFrom: new Date(parsed.data.validFrom),
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('International transfer recorded', { recipientCountry: parsed.data.recipientCountry, mechanism: parsed.data.transferMechanism });
    res.status(201).json({ success: true, data: transfer });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record transfer' } });
  }
});

// ── Privacy by Design / DPIA (Art 25) ─────────────────────────────────────

router.get('/privacy-by-design', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const [records, total] = await Promise.all([
      prisma.isPrivacyByDesign.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.isPrivacyByDesign.count({ where: { deletedAt: null } }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list privacy by design records' } });
  }
});

router.post('/privacy-by-design', async (req: Request, res: Response) => {
  try {
    const parsed = privacyByDesignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const record = await prisma.isPrivacyByDesign.create({
      data: {
        id: uuidv4(), ...parsed.data,
        dpiaDate: parsed.data.dpiaDate ? new Date(parsed.data.dpiaDate) : undefined,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : undefined,
        status: 'IN_PROGRESS',
      },
    });
    logger.info('Privacy by Design record created', { projectName: parsed.data.projectName });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create privacy by design record' } });
  }
});

// ── SA Complaints (Art 77) ─────────────────────────────────────────────────

router.get('/sa-complaints', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [complaints, total] = await Promise.all([
      prisma.isSaComplaint.findMany({ where, skip, take: limit, orderBy: { receivedDate: 'desc' } }),
      prisma.isSaComplaint.count({ where }),
    ]);
    res.json({ success: true, data: complaints, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list SA complaints' } });
  }
});

router.post('/sa-complaints', async (req: Request, res: Response) => {
  try {
    const parsed = saComplaintSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const complaint = await prisma.isSaComplaint.create({
      data: {
        id: uuidv4(), ...parsed.data,
        receivedDate: new Date(parsed.data.receivedDate),
        responseDeadline: parsed.data.responseDeadline ? new Date(parsed.data.responseDeadline) : undefined,
        status: 'OPEN',
      },
    });
    logger.info('SA complaint registered', { supervisoryAuthority: parsed.data.supervisoryAuthority });
    res.status(201).json({ success: true, data: complaint });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register SA complaint' } });
  }
});

router.put('/sa-complaints/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isSaComplaint.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SA complaint not found' } });
    const updateSchema = saComplaintSchema.partial().extend({
      status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'RESPONDED', 'ESCALATED', 'CLOSED']).optional(),
      responseNotes: z.string().trim().optional(),
      resolvedAt: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { receivedDate, responseDeadline, resolvedAt, ...rest } = parsed.data;
    const updated = await prisma.isSaComplaint.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(receivedDate ? { receivedDate: new Date(receivedDate) } : {}),
        ...(responseDeadline ? { responseDeadline: new Date(responseDeadline) } : {}),
        ...(resolvedAt ? { resolvedAt: new Date(resolvedAt) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update SA complaint' } });
  }
});

export default router;
