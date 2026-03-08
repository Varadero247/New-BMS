// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { PRICING } from '@ims/config';

const router = Router();

// ─── Partner Organisations ────────────────────────────────────────────────────

// GET /api/billing/partners
router.get('/', async (req: Request, res: Response) => {
  try {
    const { partnerTier, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {};
    if (partnerTier) where.partnerTier = partnerTier;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      (prisma as any).partnerOrganisation.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).partnerOrganisation.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// GET /api/billing/partners/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partner = await (prisma as any).partnerOrganisation.findUnique({
      where: { id: req.params.id },
      include: { dealRegistrations: true, partnerCommissions: true, nfrSubscriptions: true },
    });
    if (!partner) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Partner not found' } });
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// POST /api/billing/partners
router.post('/', async (req: Request, res: Response) => {
  try {
    const { organisationId, partnerTier, contractedACVTarget } = req.body;
    if (!organisationId || !partnerTier) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'organisationId and partnerTier are required' } });
    }

    // Look up discount from config
    const tierConfig = (PRICING.partnerships.tiers as any)[partnerTier];
    const resellerDiscountPct = tierConfig?.resellerDiscountPct || null;
    const nfrLicencesAllowed = tierConfig?.nfrLicences || 0;

    const partner = await (prisma as any).partnerOrganisation.create({
      data: {
        organisationId,
        partnerTier,
        resellerDiscountPct,
        nfrLicencesAllowed,
        contractedACVTarget: contractedACVTarget || null,
      },
    });

    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// PATCH /api/billing/partners/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, actualACVYTD, certificationStatus, channelManagerId } = req.body;
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (actualACVYTD !== undefined) data.actualACVYTD = actualACVYTD;
    if (certificationStatus !== undefined) data.certificationStatus = certificationStatus;
    if (channelManagerId !== undefined) data.channelManagerId = channelManagerId;

    const partner = await (prisma as any).partnerOrganisation.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// DELETE /api/billing/partners/:id (soft delete via status)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const partner = await (prisma as any).partnerOrganisation.update({
      where: { id: req.params.id },
      data: { status: 'CHURNED' },
    });
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// ─── Deal Registrations ───────────────────────────────────────────────────────

// GET /api/billing/partners/:id/deals
router.get('/:id/deals', async (req: Request, res: Response) => {
  try {
    const deals = await (prisma as any).dealRegistration.findMany({
      where: { partnerId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// POST /api/billing/partners/:id/deals
router.post('/:id/deals', async (req: Request, res: Response) => {
  try {
    const { prospectName, prospectEmail, prospectCompany, estimatedUsers, estimatedTier, estimatedACV } = req.body;
    if (!prospectName || !prospectCompany || !estimatedUsers || !estimatedTier || !estimatedACV) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Required fields missing' } });
    }

    if (estimatedACV < PRICING.partnerships.dealRegistration.minimumDealACVForRegistration) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACV_TOO_LOW',
          message: `Minimum ACV for deal registration is £${PRICING.partnerships.dealRegistration.minimumDealACVForRegistration}`,
        },
      });
    }

    const protectedUntil = new Date();
    protectedUntil.setDate(protectedUntil.getDate() + PRICING.partnerships.dealRegistration.protectionPeriodDays);

    const deal = await (prisma as any).dealRegistration.create({
      data: {
        partnerId: req.params.id,
        prospectName,
        prospectEmail: prospectEmail || null,
        prospectCompany,
        estimatedUsers,
        estimatedTier,
        estimatedACV,
        protectedUntil,
        status: 'REGISTERED',
      },
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// ─── Commissions ─────────────────────────────────────────────────────────────

// GET /api/billing/partners/:id/commissions
router.get('/:id/commissions', async (req: Request, res: Response) => {
  try {
    const commissions = await (prisma as any).partnerCommission.findMany({
      where: { partnerId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: commissions });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

export default router;
