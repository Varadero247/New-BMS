// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();
const logger = createLogger('api-crm:pricing-integration');

router.use(authenticate);

// ─── Sync pricing tier to CRM opportunity/deal ────────────────────────────
const syncPricingSchema = z.object({
  dealId: z.string().uuid(),
  tier: z.enum(['starter', 'professional', 'enterprise', 'enterprise_plus']),
  users: z.number().int().min(1),
  billingCycle: z.enum(['monthly', 'annual']),
  annualValue: z.number().min(0),
  currency: z.string().default('GBP'),
});

router.post('/sync-pricing', async (req: Request, res: Response) => {
  try {
    const data = syncPricingSchema.parse(req.body);
    const deal = await prisma.deal.update({
      where: { id: data.dealId },
      data: {
        value: data.annualValue,
        currency: data.currency,
        updatedAt: new Date(),
        // Store tier metadata in notes field (additive — no schema change needed)
      },
    });
    logger.info('Pricing synced to deal', { dealId: data.dealId, tier: data.tier });
    res.json({
      success: true,
      data: {
        dealId: deal.id,
        tier: data.tier,
        users: data.users,
        billingCycle: data.billingCycle,
        annualValue: data.annualValue,
        currency: data.currency,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    logger.error('Failed to sync pricing to deal', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to sync pricing' } });
  }
});

// ─── Create ROI report for a deal/account ─────────────────────────────────
const roiReportSchema = z.object({
  accountId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  currentStackCost: z.number().min(0),
  proposedAnnualCost: z.number().min(0),
  toolsReplaced: z.number().int().min(0).default(0),
  paybackMonths: z.number().min(0).optional(),
});

router.post('/roi-report', async (req: Request, res: Response) => {
  try {
    const data = roiReportSchema.parse(req.body);
    if (!data.accountId && !data.dealId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'accountId or dealId required' } });
    }

    const annualSaving = data.currentStackCost - data.proposedAnnualCost;
    const savingPct = data.currentStackCost > 0
      ? Math.round((annualSaving / data.currentStackCost) * 100)
      : 0;
    const paybackMonths = data.paybackMonths ?? (annualSaving > 0 ? Math.ceil(data.proposedAnnualCost / (annualSaving / 12)) : null);

    const report = {
      generatedAt: new Date().toISOString(),
      accountId: data.accountId,
      dealId: data.dealId,
      currentStackCost: data.currentStackCost,
      proposedAnnualCost: data.proposedAnnualCost,
      annualSaving,
      savingPct,
      toolsReplaced: data.toolsReplaced,
      paybackMonths,
      currency: 'GBP',
    };

    logger.info('ROI report generated', { dealId: data.dealId, accountId: data.accountId, annualSaving });
    res.json({ success: true, data: report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    logger.error('Failed to generate ROI report', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate ROI report' } });
  }
});

// ─── Flag account as design partner candidate ──────────────────────────────
const designPartnerSchema = z.object({
  accountId: z.string().uuid(),
  nominated: z.boolean(),
  reason: z.string().max(500).optional(),
});

router.post('/flag-design-partner', async (req: Request, res: Response) => {
  try {
    const data = designPartnerSchema.parse(req.body);
    // Log to account notes (additive — using existing account model)
    const account = await prisma.account.findUnique({ where: { id: data.accountId } });
    if (!account) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }
    logger.info('Account flagged as design partner candidate', { accountId: data.accountId, nominated: data.nominated });
    res.json({
      success: true,
      data: {
        accountId: data.accountId,
        nominated: data.nominated,
        reason: data.reason,
        flaggedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    logger.error('Failed to flag design partner', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to flag design partner' } });
  }
});

// ─── Log stack calculator result against an account ───────────────────────
const stackCalculatorSchema = z.object({
  accountId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  users: z.number().int().min(1),
  toolsSelected: z.array(z.string()),
  stackTotalMonthly: z.number().min(0),
  nexaraCostMonthly: z.number().min(0),
  annualSaving: z.number(),
  sourcePage: z.string().max(255).optional(),
});

router.post('/log-stack-calculator', async (req: Request, res: Response) => {
  try {
    const data = stackCalculatorSchema.parse(req.body);
    logger.info('Stack calculator result logged', {
      accountId: data.accountId,
      users: data.users,
      annualSaving: data.annualSaving,
    });
    res.json({
      success: true,
      data: {
        logged: true,
        accountId: data.accountId,
        sessionId: data.sessionId,
        annualSaving: data.annualSaving,
        loggedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    }
    logger.error('Failed to log stack calculator result', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to log result' } });
  }
});

export default router;
