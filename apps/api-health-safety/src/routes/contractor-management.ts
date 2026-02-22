import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-health-safety');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ISO 45001:2018 Clause 8.4 / 8.1.4 — Procurement & Contractor OHS Management

const contractorSchema = z.object({
  companyName: z.string().trim().min(1),
  contactName: z.string().trim().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().trim().optional(),
  workType: z.string().trim().min(1),
  workLocation: z.string().trim().min(1),
  startDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  endDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  ohsRequirements: z.string().trim().min(1),
  inductionCompleted: z.boolean().optional(),
  inductionDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  insuranceRef: z.string().trim().optional(),
  insuranceExpiry: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  approvedBy: z.string().trim().optional(),
});

const inspectionSchema = z.object({
  contractorId: z.string().uuid(),
  inspectedBy: z.string().trim().min(1),
  inspectionDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  findings: z.string().trim().min(1),
  nonConformances: z.string().trim().optional(),
  correctiveActions: z.string().trim().optional(),
  outcome: z.enum(['SATISFACTORY', 'REQUIRES_IMPROVEMENT', 'UNSATISFACTORY', 'SUSPENDED']),
});

// GET / - list contractors
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, workLocation } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (workLocation) where.workLocation = workLocation;
    const [contractors, total] = await Promise.all([
      prisma.hSContractor.findMany({ where, skip, take: limit, orderBy: { startDate: 'desc' }, include: { inspections: { orderBy: { inspectionDate: 'desc' }, take: 1 } } }),
      prisma.hSContractor.count({ where }),
    ]);
    res.json({ success: true, data: contractors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list contractors', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list contractors' } });
  }
});

// POST / - register contractor
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = contractorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const contractor = await prisma.hSContractor.create({
      data: {
        id: uuidv4(), ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
        inductionDate: parsed.data.inductionDate ? new Date(parsed.data.inductionDate) : undefined,
        insuranceExpiry: parsed.data.insuranceExpiry ? new Date(parsed.data.insuranceExpiry) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('Contractor registered', { companyName: parsed.data.companyName });
    res.status(201).json({ success: true, data: contractor });
  } catch (error: unknown) {
    logger.error('Failed to register contractor', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register contractor' } });
  }
});

// GET /stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, active, suspended, completed] = await Promise.all([
      prisma.hSContractor.count({ where: { deletedAt: null } }),
      prisma.hSContractor.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.hSContractor.count({ where: { deletedAt: null, status: 'SUSPENDED' } }),
      prisma.hSContractor.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
    ]);
    const uninducted = await prisma.hSContractor.count({ where: { deletedAt: null, status: 'ACTIVE', inductionCompleted: false } });
    res.json({ success: true, data: { total, active, suspended, completed, uninductedActive: uninducted } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contractor = await prisma.hSContractor.findUnique({ where: { id: req.params.id }, include: { inspections: { orderBy: { inspectionDate: 'desc' } } } });
    if (!contractor || contractor.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contractor not found' } });
    }
    res.json({ success: true, data: contractor });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get contractor' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSContractor.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contractor not found' } });
    }
    const updateSchema = contractorSchema.partial().extend({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'COMPLETED', 'TERMINATED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { startDate, endDate, inductionDate, insuranceExpiry, ...rest } = parsed.data;
    const updated = await prisma.hSContractor.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(inductionDate ? { inductionDate: new Date(inductionDate) } : {}),
        ...(insuranceExpiry ? { insuranceExpiry: new Date(insuranceExpiry) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update contractor' } });
  }
});

// POST /:id/inspections - record OHS inspection
router.post('/:id/inspections', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSContractor.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contractor not found' } });
    }
    const parsed = inspectionSchema.safeParse({ ...req.body, contractorId: req.params.id });
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const inspection = await prisma.hSContractorInspection.create({
      data: { id: uuidv4(), ...parsed.data, inspectionDate: new Date(parsed.data.inspectionDate) },
    });
    // If unsatisfactory, auto-suspend contractor
    if (parsed.data.outcome === 'SUSPENDED') {
      await prisma.hSContractor.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED' } });
    }
    logger.info('Contractor inspection recorded', { contractorId: req.params.id, outcome: parsed.data.outcome });
    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record inspection' } });
  }
});

// GET /:id/inspections
router.get('/:id/inspections', async (req: Request, res: Response) => {
  try {
    const inspections = await prisma.hSContractorInspection.findMany({
      where: { contractorId: req.params.id },
      orderBy: { inspectionDate: 'desc' },
    });
    res.json({ success: true, data: inspections });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list inspections' } });
  }
});

export default router;
