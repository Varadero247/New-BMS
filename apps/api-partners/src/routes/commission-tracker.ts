// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('api-partners:commission-tracker');

type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'DISPUTED' | 'CANCELLED';
type CommissionType = 'NEW_BUSINESS' | 'RENEWAL' | 'UPSELL' | 'REFERRAL';

interface CommissionRecord {
  id: string;
  partnerId: string;
  dealId?: string;
  referenceNumber: string;
  type: CommissionType;
  customerName: string;
  invoiceReference?: string;
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: CommissionStatus;
  periodMonth: string;  // e.g. "2026-02"
  earnedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  paymentReference?: string;
  notes?: string;
}

interface CommissionSummary {
  partnerId: string;
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  totalApproved: number;
  currency: string;
  byPeriod: Array<{ period: string; earned: number; paid: number }>;
  ytdEarned: number;
  ytdPaid: number;
}

// Demo commission records
const commissionStore = new Map<string, CommissionRecord>();

function seedDemoCommissions(partnerId: string): void {
  if (Array.from(commissionStore.values()).some(c => c.partnerId === partnerId)) return;

  const demoRecords: Omit<CommissionRecord, 'id'>[] = [
    { partnerId, referenceNumber: 'CM-2025-0001', type: 'NEW_BUSINESS', customerName: 'Acme Manufacturing Ltd', invoiceReference: 'INV-2025-1234', baseAmount: 24000, commissionRate: 15, commissionAmount: 3600, currency: 'GBP', status: 'PAID', periodMonth: '2025-10', earnedAt: new Date('2025-10-15'), approvedAt: new Date('2025-10-20'), paidAt: new Date('2025-11-01'), paymentReference: 'BAC-001' },
    { partnerId, referenceNumber: 'CM-2025-0002', type: 'REFERRAL', customerName: 'BuildRight Contractors', invoiceReference: 'INV-2025-1456', baseAmount: 18000, commissionRate: 10, commissionAmount: 1800, currency: 'GBP', status: 'PAID', periodMonth: '2025-11', earnedAt: new Date('2025-11-10'), approvedAt: new Date('2025-11-15'), paidAt: new Date('2025-12-01'), paymentReference: 'BAC-002' },
    { partnerId, referenceNumber: 'CM-2025-0003', type: 'RENEWAL', customerName: 'Acme Manufacturing Ltd', invoiceReference: 'INV-2025-1890', baseAmount: 24000, commissionRate: 5, commissionAmount: 1200, currency: 'GBP', status: 'APPROVED', periodMonth: '2025-12', earnedAt: new Date('2025-12-15'), approvedAt: new Date('2025-12-20') },
    { partnerId, referenceNumber: 'CM-2026-0001', type: 'NEW_BUSINESS', customerName: 'MedTech Solutions Ltd', invoiceReference: 'INV-2026-0234', baseAmount: 36000, commissionRate: 15, commissionAmount: 5400, currency: 'GBP', status: 'PENDING', periodMonth: '2026-01', earnedAt: new Date('2026-01-20') },
    { partnerId, referenceNumber: 'CM-2026-0002', type: 'UPSELL', customerName: 'BuildRight Contractors', invoiceReference: 'INV-2026-0312', baseAmount: 6000, commissionRate: 10, commissionAmount: 600, currency: 'GBP', status: 'PENDING', periodMonth: '2026-02', earnedAt: new Date('2026-02-05') },
  ];

  for (const record of demoRecords) {
    const id = `comm_${record.referenceNumber}`;
    commissionStore.set(id, { id, ...record });
  }
}

function getPartnerId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

function buildSummary(records: CommissionRecord[]): CommissionSummary {
  const currency = records[0]?.currency ?? 'GBP';
  const now = new Date();
  const ytdStart = new Date(now.getFullYear(), 0, 1);

  const totalEarned = records.reduce((s, r) => s + r.commissionAmount, 0);
  const totalPaid = records.filter(r => r.status === 'PAID').reduce((s, r) => s + r.commissionAmount, 0);
  const totalPending = records.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.commissionAmount, 0);
  const totalApproved = records.filter(r => r.status === 'APPROVED').reduce((s, r) => s + r.commissionAmount, 0);

  const ytdRecords = records.filter(r => r.earnedAt >= ytdStart);
  const ytdEarned = ytdRecords.reduce((s, r) => s + r.commissionAmount, 0);
  const ytdPaid = ytdRecords.filter(r => r.status === 'PAID').reduce((s, r) => s + r.commissionAmount, 0);

  const byPeriodMap = new Map<string, { earned: number; paid: number }>();
  for (const r of records) {
    const existing = byPeriodMap.get(r.periodMonth) ?? { earned: 0, paid: 0 };
    existing.earned += r.commissionAmount;
    if (r.status === 'PAID') existing.paid += r.commissionAmount;
    byPeriodMap.set(r.periodMonth, existing);
  }
  const byPeriod = Array.from(byPeriodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({ period, ...data }));

  return {
    partnerId: records[0]?.partnerId ?? '',
    totalEarned,
    totalPaid,
    totalPending,
    totalApproved,
    currency,
    byPeriod,
    ytdEarned,
    ytdPaid,
  };
}

router.use(authenticate);

// GET /api/partner/commissions — list all commission records
router.get('/', (req: Request, res: Response) => {
  const partnerId = getPartnerId(req);
  seedDemoCommissions(partnerId);

  const records = Array.from(commissionStore.values()).filter(c => c.partnerId === partnerId);
  const { status, period } = req.query;
  const filtered = records.filter(c =>
    (!status || c.status === status) &&
    (!period || c.periodMonth === period),
  );
  filtered.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());

  logger.info('Commission records fetched', { partnerId, count: filtered.length });
  res.json({ success: true, data: filtered });
});

// GET /api/partner/commissions/summary — aggregated summary
router.get('/summary', (req: Request, res: Response) => {
  const partnerId = getPartnerId(req);
  seedDemoCommissions(partnerId);

  const records = Array.from(commissionStore.values()).filter(c => c.partnerId === partnerId);
  if (records.length === 0) {
    return res.json({ success: true, data: { partnerId, totalEarned: 0, totalPaid: 0, totalPending: 0, totalApproved: 0, currency: 'GBP', byPeriod: [], ytdEarned: 0, ytdPaid: 0 } });
  }
  const summary = buildSummary(records);
  res.json({ success: true, data: summary });
});

// GET /api/partner/commissions/:id
router.get('/:id', (req: Request, res: Response) => {
  const record = commissionStore.get(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Commission record not found' } });
  }
  const partnerId = getPartnerId(req);
  if (record.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: record });
});

export default router;
