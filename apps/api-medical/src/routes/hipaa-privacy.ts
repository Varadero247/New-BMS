// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const policySchema = z.object({
  version: z.string().trim().min(1).max(50),
  effectiveDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  nppSummary: z.string().trim().min(1),
  fullText: z.string().trim().min(1),
  reviewedBy: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
});

const disclosureSchema = z.object({
  disclosureDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  recipient: z.string().trim().min(1),
  recipientType: z.enum([
    'TREATMENT_PROVIDER', 'PAYMENT_ENTITY', 'HEALTHCARE_OPERATIONS', 'BUSINESS_ASSOCIATE',
    'INDIVIDUAL', 'PUBLIC_HEALTH', 'LAW_ENFORCEMENT', 'LEGAL', 'RESEARCH', 'OTHER',
  ]),
  purpose: z.string().trim().min(1),
  phiCategories: z.array(z.string()).min(1),
  minimumNecessary: z.boolean().optional(),
  patientAuthorized: z.boolean().optional(),
  authorizationRef: z.string().trim().optional(),
  legalBasis: z.string().trim().optional(),
  recordedBy: z.string().trim().min(1),
  notes: z.string().trim().optional(),
});

// GET /stats - summary statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [totalPolicies, activePolicies, disclosuresThisYear, trainingCompletionsThisYear] =
      await Promise.all([
        prisma.hipaaPrivacyPolicy.count({ where: { deletedAt: null } }),
        prisma.hipaaPrivacyPolicy.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.hipaaPhiDisclosure.count({ where: { deletedAt: null, disclosureDate: { gte: yearStart } } }),
        prisma.hipaaTrainingRecord.count({ where: { completedDate: { gte: yearStart } } }),
      ]);
    res.json({ success: true, data: { totalPolicies, activePolicies, disclosuresThisYear, trainingCompletionsThisYear } });
  } catch (error: unknown) {
    logger.error('Failed to get HIPAA stats', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

// GET /disclosures - list PHI disclosures
router.get('/disclosures', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const { recipientType } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (recipientType) where.recipientType = recipientType;
    const [disclosures, total] = await Promise.all([
      prisma.hipaaPhiDisclosure.findMany({ where, skip, take: limit, orderBy: { disclosureDate: 'desc' } }),
      prisma.hipaaPhiDisclosure.count({ where }),
    ]);
    res.json({ success: true, data: disclosures, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list disclosures' } });
  }
});

// POST /disclosures - log PHI disclosure
router.post('/disclosures', async (req: Request, res: Response) => {
  try {
    const parsed = disclosureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const disclosure = await prisma.hipaaPhiDisclosure.create({
      data: { id: uuidv4(), ...parsed.data, disclosureDate: new Date(parsed.data.disclosureDate) },
    });
    res.status(201).json({ success: true, data: disclosure });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to log disclosure' } });
  }
});

// GET /minimum-necessary - list minimum necessary policies
router.get('/minimum-necessary', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    const [records, total] = await Promise.all([
      prisma.hipaaMinimumNecessary.findMany({ where, skip, take: limit, orderBy: { role: 'asc' } }),
      prisma.hipaaMinimumNecessary.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list minimum necessary policies' } });
  }
});

// POST /minimum-necessary - create minimum necessary policy
router.post('/minimum-necessary', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      role: z.string().trim().min(1),
      phiCategory: z.string().trim().min(1),
      accessLevel: z.string().trim().min(1),
      justification: z.string().trim().min(1),
      approvedBy: z.string().trim().min(1),
      effectiveDate: z.string().refine((s) => !isNaN(Date.parse(s))),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const record = await prisma.hipaaMinimumNecessary.create({
      data: { id: uuidv4(), ...parsed.data, effectiveDate: new Date(parsed.data.effectiveDate) },
    });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create minimum necessary policy' } });
  }
});

// GET /training - list training records
router.get('/training', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const { trainingType } = req.query;
    const where: Record<string, unknown> = {};
    if (trainingType) where.trainingType = trainingType;
    const [records, total] = await Promise.all([
      prisma.hipaaTrainingRecord.findMany({ where, skip, take: limit, orderBy: { completedDate: 'desc' } }),
      prisma.hipaaTrainingRecord.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list training records' } });
  }
});

// POST /training - add training record
router.post('/training', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().min(1),
      employeeName: z.string().trim().min(1),
      trainingType: z.enum(['INITIAL_TRAINING', 'ANNUAL_REFRESHER', 'ROLE_SPECIFIC', 'BREACH_RESPONSE', 'NEW_POLICY']),
      completedDate: z.string().refine((s) => !isNaN(Date.parse(s))),
      trainingModule: z.string().trim().min(1),
      score: z.number().int().min(0).max(100).optional(),
      passed: z.boolean().optional(),
      certifiedBy: z.string().trim().optional(),
      expiryDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
      notes: z.string().trim().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const record = await prisma.hipaaTrainingRecord.create({
      data: {
        id: uuidv4(), ...parsed.data,
        completedDate: new Date(parsed.data.completedDate),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : undefined,
      },
    });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add training record' } });
  }
});

// GET / - list NPP versions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [policies, total] = await Promise.all([
      prisma.hipaaPrivacyPolicy.findMany({ where, skip, take: limit, orderBy: { effectiveDate: 'desc' } }),
      prisma.hipaaPrivacyPolicy.count({ where }),
    ]);
    res.json({ success: true, data: policies, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list privacy policies', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list privacy policies' } });
  }
});

// POST / - create NPP
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = policySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const policy = await prisma.hipaaPrivacyPolicy.create({
      data: { id: uuidv4(), ...parsed.data, effectiveDate: new Date(parsed.data.effectiveDate), status: 'DRAFT' },
    });
    res.status(201).json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to create privacy policy', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create privacy policy' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const policy = await prisma.hipaaPrivacyPolicy.findUnique({ where: { id: req.params.id } });
    if (!policy || policy.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Privacy policy not found' } });
    }
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get privacy policy' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaPrivacyPolicy.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Privacy policy not found' } });
    }
    const updateSchema = policySchema.partial().extend({
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const updated = await prisma.hipaaPrivacyPolicy.update({
      where: { id: req.params.id },
      data: { ...parsed.data, effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : undefined },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update privacy policy' } });
  }
});

export default router;
