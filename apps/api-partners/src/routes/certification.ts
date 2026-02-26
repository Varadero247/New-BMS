// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const router = Router();
const logger = createLogger('api-partners:certification');

type CertificationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CERTIFIED' | 'EXPIRED' | 'REVOKED';
type CertificationTier = 'REGISTERED' | 'CERTIFIED' | 'GOLD' | 'PLATINUM';
type CompetencyArea = 'IMPLEMENTATION' | 'TRAINING' | 'SUPPORT' | 'SALES' | 'TECHNICAL';

interface CertificationRequirement {
  id: string;
  title: string;
  description: string;
  type: 'EXAM' | 'TRAINING' | 'CASE_STUDY' | 'REFERENCE' | 'REVENUE';
  targetValue?: number;
  targetUnit?: string;
  mandatory: boolean;
}

interface PartnerCertification {
  id: string;
  partnerId: string;
  tier: CertificationTier;
  competencyArea: CompetencyArea;
  status: CertificationStatus;
  score?: number;
  certificationNumber?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  requirements: Array<{
    requirementId: string;
    met: boolean;
    evidence?: string;
    completedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CERTIFICATION_REQUIREMENTS: Record<string, CertificationRequirement[]> = {
  REGISTERED: [
    { id: 'reg-1', title: 'Partner Agreement Signed', description: 'Valid Nexara Certified Partner Agreement in place', type: 'REFERENCE', mandatory: true },
    { id: 'reg-2', title: 'Core Platform Training', description: 'Complete Nexara IMS Core Platform training (8 hours)', type: 'TRAINING', targetValue: 8, targetUnit: 'hours', mandatory: true },
  ],
  CERTIFIED: [
    { id: 'cert-1', title: 'Certified Implementer Exam', description: 'Pass the Nexara Certified Implementer exam with ≥75%', type: 'EXAM', targetValue: 75, targetUnit: '%', mandatory: true },
    { id: 'cert-2', title: 'Successful Implementation', description: 'Demonstrate one successful customer go-live', type: 'CASE_STUDY', mandatory: true },
    { id: 'cert-3', title: 'Platform Revenue', description: 'Achieve £25,000 total platform revenue', type: 'REVENUE', targetValue: 25000, targetUnit: 'GBP', mandatory: false },
  ],
  GOLD: [
    { id: 'gold-1', title: 'Gold Exam', description: 'Pass the Nexara Gold Partner exam with ≥80%', type: 'EXAM', targetValue: 80, targetUnit: '%', mandatory: true },
    { id: 'gold-2', title: 'Three Reference Implementations', description: 'Provide three verified customer reference sites', type: 'REFERENCE', targetValue: 3, targetUnit: 'references', mandatory: true },
    { id: 'gold-3', title: 'Annual Revenue Threshold', description: 'Achieve £100,000 annual platform revenue', type: 'REVENUE', targetValue: 100000, targetUnit: 'GBP', mandatory: true },
  ],
  PLATINUM: [
    { id: 'plat-1', title: 'Platinum Assessment', description: 'Successfully complete Nexara Platinum Partner Assessment', type: 'EXAM', targetValue: 90, targetUnit: '%', mandatory: true },
    { id: 'plat-2', title: 'Ten Reference Sites', description: 'Provide ten verified customer reference sites across at least three industries', type: 'REFERENCE', targetValue: 10, targetUnit: 'references', mandatory: true },
    { id: 'plat-3', title: 'Annual Revenue Threshold', description: 'Achieve £500,000 annual platform revenue', type: 'REVENUE', targetValue: 500000, targetUnit: 'GBP', mandatory: true },
    { id: 'plat-4', title: 'Dedicated Practice', description: 'Maintain a dedicated Nexara IMS practice with ≥3 certified consultants', type: 'TRAINING', targetValue: 3, targetUnit: 'consultants', mandatory: true },
  ],
};

const certificationStore = new Map<string, PartnerCertification>();

function getPartnerId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

router.use(authenticate);

// GET /api/partner/certifications/requirements — get tier requirements
router.get('/requirements', (req: Request, res: Response) => {
  const schema = z.object({ tier: z.enum(['REGISTERED', 'CERTIFIED', 'GOLD', 'PLATINUM']).optional() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const tier = parsed.data.tier;
  if (tier) {
    return res.json({ success: true, data: { tier, requirements: CERTIFICATION_REQUIREMENTS[tier] ?? [] } });
  }
  res.json({ success: true, data: CERTIFICATION_REQUIREMENTS });
});

// GET /api/partner/certifications — list partner certifications
router.get('/', (req: Request, res: Response) => {
  const partnerId = getPartnerId(req);
  const certs = Array.from(certificationStore.values()).filter(c => c.partnerId === partnerId);

  // Return current tier summary
  const certifiedTiers: CertificationTier[] = [];
  for (const cert of certs) {
    if (cert.status === 'CERTIFIED') certifiedTiers.push(cert.tier);
  }

  let currentTier: CertificationTier = 'REGISTERED';
  if (certifiedTiers.includes('PLATINUM')) currentTier = 'PLATINUM';
  else if (certifiedTiers.includes('GOLD')) currentTier = 'GOLD';
  else if (certifiedTiers.includes('CERTIFIED')) currentTier = 'CERTIFIED';

  res.json({ success: true, data: { currentTier, certifications: certs } });
});

// POST /api/partner/certifications — apply for certification
router.post('/', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    tier: z.enum(['REGISTERED', 'CERTIFIED', 'GOLD', 'PLATINUM'] as [CertificationTier, ...CertificationTier[]]),
    competencyArea: z.enum(['IMPLEMENTATION', 'TRAINING', 'SUPPORT', 'SALES', 'TECHNICAL'] as [CompetencyArea, ...CompetencyArea[]]).default('IMPLEMENTATION'),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const partnerId = getPartnerId(req);
  const id = `pcert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const requirements = CERTIFICATION_REQUIREMENTS[parsed.data.tier] ?? [];

  const certification: PartnerCertification = {
    id,
    partnerId,
    tier: parsed.data.tier,
    competencyArea: parsed.data.competencyArea,
    status: 'IN_PROGRESS',
    requirements: requirements.map(r => ({ requirementId: r.id, met: false })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  certificationStore.set(id, certification);
  logger.info('Partner certification application created', { id, partnerId, tier: parsed.data.tier });

  res.status(201).json({ success: true, data: certification });
});

// PATCH /api/partner/certifications/:id/requirements/:reqId — mark requirement as met
router.patch('/:id/requirements/:reqId', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const cert = certificationStore.get(req.params.id);
  if (!cert) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
  }
  const partnerId = getPartnerId(req);
  if (cert.partnerId !== partnerId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const reqIndex = cert.requirements.findIndex(r => r.requirementId === req.params.reqId);
  if (reqIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Requirement not found' } });
  }

  const bodySchema = z.object({ evidence: z.string().optional() });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  cert.requirements[reqIndex].met = true;
  cert.requirements[reqIndex].evidence = parsed.data.evidence;
  cert.requirements[reqIndex].completedAt = new Date();
  cert.updatedAt = new Date();

  // Check if all mandatory requirements met → auto-submit
  const tierReqs = CERTIFICATION_REQUIREMENTS[cert.tier] ?? [];
  const mandatoryMet = tierReqs
    .filter(r => r.mandatory)
    .every(r => cert.requirements.find(cr => cr.requirementId === r.id)?.met);

  if (mandatoryMet && cert.status === 'IN_PROGRESS') {
    cert.status = 'SUBMITTED';
    logger.info('Certification auto-submitted', { id: cert.id, partnerId, tier: cert.tier });
  }

  certificationStore.set(cert.id, cert);
  res.json({ success: true, data: cert });
});

export default router;
