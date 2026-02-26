// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('api-partners:deal-registration');

type DealStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WON' | 'LOST' | 'EXPIRED';

interface DealRegistration {
  id: string;
  partnerId: string;
  referenceNumber: string;
  prospectName: string;
  prospectDomain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  industry: string;
  estimatedValue: number;
  currency: string;
  estimatedCloseDate: string;
  expectedModules: string[];
  status: DealStatus;
  notes?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  commissionRate?: number;  // % from payout tier
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;  // 90 days from registration
}

const dealStore = new Map<string, DealRegistration>();
let dealCounter = 1000;

function getPartnerId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

router.use(authenticate);

// GET /api/partner/deal-registrations
router.get('/', (req: Request, res: Response) => {
  const partnerId = getPartnerId(req);
  const deals = Array.from(dealStore.values()).filter(d => d.partnerId === partnerId);

  // Simple filter support
  const { status } = req.query;
  const filtered = status ? deals.filter(d => d.status === status) : deals;
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json({ success: true, data: filtered });
});

// POST /api/partner/deal-registrations
router.post('/', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    prospectName: z.string().min(1).max(200),
    prospectDomain: z.string().min(1).max(100),
    contactName: z.string().min(1).max(100),
    contactEmail: z.string().email(),
    contactPhone: z.string().optional(),
    industry: z.string().min(1),
    estimatedValue: z.number().positive(),
    currency: z.string().length(3).default('GBP'),
    estimatedCloseDate: z.string().min(1),
    expectedModules: z.array(z.string()).default([]),
    notes: z.string().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const partnerId = getPartnerId(req);

  // Check for duplicate (same prospect domain, active deal)
  const existingDeal = Array.from(dealStore.values()).find(
    d => d.partnerId === partnerId &&
      d.prospectDomain.toLowerCase() === parsed.data.prospectDomain.toLowerCase() &&
      !['REJECTED', 'LOST', 'EXPIRED'].includes(d.status),
  );
  if (existingDeal) {
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE_DEAL', message: `An active deal registration already exists for ${parsed.data.prospectDomain} (ref: ${existingDeal.referenceNumber})` } });
  }

  const id = `deal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const referenceNumber = `DR-${new Date().getFullYear()}-${String(++dealCounter).padStart(5, '0')}`;
  const deal: DealRegistration = {
    id,
    partnerId,
    referenceNumber,
    ...parsed.data,
    status: 'SUBMITTED',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  };
  dealStore.set(id, deal);
  logger.info('Deal registered', { id, referenceNumber, partnerId, prospectDomain: deal.prospectDomain });

  // Auto-approve deals under £10k (simulation)
  if (deal.estimatedValue < 10000) {
    setTimeout(() => {
      const d = dealStore.get(id);
      if (d) {
        d.status = 'APPROVED';
        d.approvedAt = new Date();
        d.commissionRate = 10;
        d.updatedAt = new Date();
        dealStore.set(id, d);
      }
    }, 2000);
  }

  res.status(201).json({ success: true, data: deal });
});

// GET /api/partner/deal-registrations/:id
router.get('/:id', (req: Request, res: Response) => {
  const deal = dealStore.get(req.params.id);
  if (!deal) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deal registration not found' } });
  }
  const partnerId = getPartnerId(req);
  if (deal.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: deal });
});

// PATCH /api/partner/deal-registrations/:id — update status or notes
router.patch('/:id', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const deal = dealStore.get(req.params.id);
  if (!deal) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deal registration not found' } });
  }
  const partnerId = getPartnerId(req);
  if (deal.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const bodySchema = z.object({
    status: z.enum(['WON', 'LOST']).optional(),
    notes: z.string().optional(),
    estimatedCloseDate: z.string().optional(),
    estimatedValue: z.number().positive().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  if (parsed.data.status) deal.status = parsed.data.status;
  if (parsed.data.notes !== undefined) deal.notes = parsed.data.notes;
  if (parsed.data.estimatedCloseDate) deal.estimatedCloseDate = parsed.data.estimatedCloseDate;
  if (parsed.data.estimatedValue) deal.estimatedValue = parsed.data.estimatedValue;
  deal.updatedAt = new Date();
  dealStore.set(deal.id, deal);

  logger.info('Deal updated', { id: deal.id, partnerId, status: deal.status });
  res.json({ success: true, data: deal });
});

export default router;
