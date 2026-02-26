// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import {
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  calculateReadinessScore,
  type IsoCertificate,
} from '@ims/readiness';

const logger = createLogger('api-gateway:certifications');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const createCertSchema = z.object({
  standard: z.string().trim().min(1, 'Standard is required'),
  scope: z.string().trim().min(1, 'Scope is required'),
  certificationBody: z.string().trim().min(1, 'Certification body is required'),
  certificateNumber: z.string().trim().min(1, 'Certificate number is required'),
  issueDate: z
    .string()
    .min(1, 'Issue date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  lastSurveillanceDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextSurveillanceDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'EXPIRED', 'IN_RENEWAL']).default('ACTIVE'),
});

const updateCertSchema = z.object({
  standard: z.string().trim().min(1).max(200).optional(),
  scope: z.string().trim().min(1).max(2000).optional(),
  certificationBody: z.string().trim().min(1).optional(),
  certificateNumber: z.string().trim().min(1).max(200).optional(),
  issueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  expiryDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  lastSurveillanceDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextSurveillanceDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'EXPIRED', 'IN_RENEWAL']).optional(),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

function serializeCert(cert: IsoCertificate) {
  return {
    ...cert,
    issueDate: cert.issueDate instanceof Date ? cert.issueDate.toISOString() : cert.issueDate,
    expiryDate: cert.expiryDate instanceof Date ? cert.expiryDate.toISOString() : cert.expiryDate,
    lastSurveillanceDate:
      cert.lastSurveillanceDate instanceof Date
        ? cert.lastSurveillanceDate.toISOString()
        : cert.lastSurveillanceDate || null,
    nextSurveillanceDate:
      cert.nextSurveillanceDate instanceof Date
        ? cert.nextSurveillanceDate.toISOString()
        : cert.nextSurveillanceDate || null,
  };
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/certifications — List certificates with readiness scores
router.get('/', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || '00000000-0000-0000-0000-000000000001';
    const certs = listCertificates(orgId);

    const data = certs.map((cert) => {
      const readiness = calculateReadinessScore(orgId, cert.standard);
      return {
        ...serializeCert(cert),
        readinessScore: {
          ...readiness,
          lastCalculatedAt: readiness.lastCalculatedAt.toISOString(),
        },
      };
    });

    res.json({
      success: true,
      data,
      meta: { total: data.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list certifications', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list certifications' },
    });
  }
});

// POST /api/admin/certifications — Add a new certificate
router.post('/', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const parsed = createCertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || '00000000-0000-0000-0000-000000000001';
    const data = parsed.data;

    const cert = createCertificate({
      orgId,
      standard: data.standard,
      scope: data.scope,
      certificationBody: data.certificationBody,
      certificateNumber: data.certificateNumber,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
      lastSurveillanceDate: data.lastSurveillanceDate
        ? new Date(data.lastSurveillanceDate)
        : undefined,
      nextSurveillanceDate: data.nextSurveillanceDate
        ? new Date(data.nextSurveillanceDate)
        : undefined,
      status: data.status,
    });

    logger.info('Certificate created', {
      id: cert.id,
      standard: cert.standard,
      createdBy: (req as AuthRequest).user!.id,
    });

    res.status(201).json({ success: true, data: serializeCert(cert) });
  } catch (error: unknown) {
    logger.error('Failed to create certification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create certification' },
    });
  }
});

// PUT /api/admin/certifications/:id — Update a certificate
router.put('/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const parsed = updateCertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { id } = req.params;
    const data = parsed.data;

    const updateData: Partial<IsoCertificate> = {};
    if (data.standard) updateData.standard = data.standard;
    if (data.scope) updateData.scope = data.scope;
    if (data.certificationBody) updateData.certificationBody = data.certificationBody;
    if (data.certificateNumber) updateData.certificateNumber = data.certificateNumber;
    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);
    if (data.lastSurveillanceDate)
      updateData.lastSurveillanceDate = new Date(data.lastSurveillanceDate);
    if (data.nextSurveillanceDate)
      updateData.nextSurveillanceDate = new Date(data.nextSurveillanceDate);
    if (data.status) updateData.status = data.status;

    const cert = updateCertificate(id, updateData);
    if (!cert) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
    }

    logger.info('Certificate updated', { id, updatedBy: (req as AuthRequest).user!.id });

    res.json({ success: true, data: serializeCert(cert) });
  } catch (error: unknown) {
    logger.error('Failed to update certification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update certification' },
    });
  }
});

// DELETE /api/admin/certifications/:id — Remove a certificate
router.delete('/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteCertificate(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
    }

    logger.info('Certificate deleted', { id, deletedBy: (req as AuthRequest).user!.id });

    res.json({ success: true, data: { deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete certification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete certification' },
    });
  }
});

// GET /api/admin/certifications/:id/readiness — Get readiness score details
router.get('/:id/readiness', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cert = getCertificate(id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
    }

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || '00000000-0000-0000-0000-000000000001';
    const readiness = calculateReadinessScore(orgId, cert.standard);

    res.json({
      success: true,
      data: {
        certificateId: cert.id,
        standard: cert.standard,
        readiness: {
          ...readiness,
          lastCalculatedAt: readiness.lastCalculatedAt.toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get readiness score', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get readiness score' },
    });
  }
});

export default router;
