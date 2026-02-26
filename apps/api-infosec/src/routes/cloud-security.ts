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

const logger = createLogger('api-infosec');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ISO 27001:2022 Control A.5.23 — Information Security for Use of Cloud Services
// ISO 27001:2022 Control A.5.30 — ICT Readiness for Business Continuity

const cloudServiceSchema = z.object({
  serviceName: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  serviceType: z.enum(['IAAS', 'PAAS', 'SAAS', 'CAAS', 'OTHER']),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  dataResidency: z.string().trim().optional(),
  personalDataProcessed: z.boolean().optional(),
  baaRequired: z.boolean().optional(),
  encryptionAtRest: z.boolean().optional(),
  encryptionInTransit: z.boolean().optional(),
  mfaEnabled: z.boolean().optional(),
  businessOwner: z.string().trim().min(1),
  technicalContact: z.string().trim().optional(),
  contractRef: z.string().trim().optional(),
  reviewDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  riskRating: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  riskNotes: z.string().trim().optional(),
});

const ictReadinessSchema = z.object({
  systemName: z.string().trim().min(1),
  criticality: z.enum(['NON_CRITICAL', 'IMPORTANT', 'CRITICAL', 'VITAL']),
  rto: z.number().int().min(0).optional(),        // Recovery Time Objective in minutes
  rpo: z.number().int().min(0).optional(),        // Recovery Point Objective in minutes
  backupFrequency: z.string().trim().optional(),
  backupLocation: z.string().trim().optional(),
  lastBackupTest: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  failoverCapability: z.boolean().optional(),
  failoverTarget: z.string().trim().optional(),
  redundancyDetails: z.string().trim().optional(),
  bcpReference: z.string().trim().optional(),
  drpReference: z.string().trim().optional(),
  ictOwner: z.string().trim().min(1),
  lastReviewed: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
});

// GET /cloud-services - list cloud service registrations
router.get('/cloud-services', async (req: Request, res: Response) => {
  try {
    const { serviceType, dataClassification, status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (serviceType) where.serviceType = serviceType;
    if (dataClassification) where.dataClassification = dataClassification;
    if (status) where.status = status;
    const [services, total] = await Promise.all([
      prisma.isCloudService.findMany({ where, skip, take: limit, orderBy: { serviceName: 'asc' } }),
      prisma.isCloudService.count({ where }),
    ]);
    res.json({ success: true, data: services, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list cloud services', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list cloud services' } });
  }
});

// POST /cloud-services
router.post('/cloud-services', async (req: Request, res: Response) => {
  try {
    const parsed = cloudServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const service = await prisma.isCloudService.create({
      data: {
        id: uuidv4(), ...parsed.data,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('Cloud service registered', { serviceName: parsed.data.serviceName });
    res.status(201).json({ success: true, data: service });
  } catch (error: unknown) {
    logger.error('Failed to register cloud service', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register cloud service' } });
  }
});

// GET /cloud-services/:id
router.get('/cloud-services/:id', async (req: Request, res: Response) => {
  try {
    const service = await prisma.isCloudService.findUnique({ where: { id: req.params.id } });
    if (!service || service.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Cloud service not found' } });
    }
    res.json({ success: true, data: service });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get cloud service' } });
  }
});

// PUT /cloud-services/:id
router.put('/cloud-services/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isCloudService.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Cloud service not found' } });
    }
    const updateSchema = cloudServiceSchema.partial().extend({
      status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'SUSPENDED', 'DECOMMISSIONED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { reviewDate, ...rest } = parsed.data;
    const updated = await prisma.isCloudService.update({
      where: { id: req.params.id },
      data: { ...rest, ...(reviewDate ? { reviewDate: new Date(reviewDate) } : {}) },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update cloud service' } });
  }
});

// GET /ict-readiness - list ICT readiness records (A.5.30)
router.get('/ict-readiness', async (req: Request, res: Response) => {
  try {
    const { criticality } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (criticality) where.criticality = criticality;
    const [records, total] = await Promise.all([
      prisma.isIctReadiness.findMany({ where, skip, take: limit, orderBy: { criticality: 'desc' } }),
      prisma.isIctReadiness.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list ICT readiness records' } });
  }
});

// POST /ict-readiness
router.post('/ict-readiness', async (req: Request, res: Response) => {
  try {
    const parsed = ictReadinessSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const record = await prisma.isIctReadiness.create({
      data: {
        id: uuidv4(), ...parsed.data,
        lastBackupTest: parsed.data.lastBackupTest ? new Date(parsed.data.lastBackupTest) : undefined,
        lastReviewed: parsed.data.lastReviewed ? new Date(parsed.data.lastReviewed) : undefined,
      },
    });
    logger.info('ICT readiness record created', { systemName: parsed.data.systemName, criticality: parsed.data.criticality });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create ICT readiness record' } });
  }
});

// PUT /ict-readiness/:id
router.put('/ict-readiness/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isIctReadiness.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'ICT readiness record not found' } });
    }
    const updateSchema = ictReadinessSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { lastBackupTest, lastReviewed, ...rest } = parsed.data;
    const updated = await prisma.isIctReadiness.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(lastBackupTest ? { lastBackupTest: new Date(lastBackupTest) } : {}),
        ...(lastReviewed ? { lastReviewed: new Date(lastReviewed) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update ICT readiness record' } });
  }
});

export default router;
