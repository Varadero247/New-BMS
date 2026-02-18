import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('risk-appetite');

const categoryEnum = z.enum([
  'STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'ENVIRONMENTAL',
  'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'QUALITY', 'SUPPLY_CHAIN', 'TECHNOLOGY_CYBER',
  'PEOPLE_HR', 'EXTERNAL_GEOPOLITICAL', 'PROJECT_PROGRAMME', 'OTHER',
]);

const appetiteSchema = z.object({
  category: categoryEnum,
  appetiteLevel: z.enum(['VERY_LOW', 'LOW', 'MODERATE_APPETITE', 'HIGH_APPETITE', 'VERY_HIGH']),
  statement: z.string().trim().min(1).max(200),
  maximumTolerableScore: z.number().min(1).max(25),
  acceptableResidualScore: z.number().min(1).max(25),
  escalationThreshold: z.number().min(1).max(25),
  reviewDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  approvedBy: z.string().optional(),
  organisationId: z.string().optional(),
});

const frameworkSchema = z.object({
  frameworkVersion: z.string().optional(),
  policyRef: z.string().optional(),
  policyApprovedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  policyReviewDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  likelihoodScale: z.any().optional(),
  consequenceScale: z.any().optional(),
  riskLevelBands: z.any().optional(),
  overallRiskAppetite: z.enum(['VERY_LOW', 'LOW', 'MODERATE_APPETITE', 'HIGH_APPETITE', 'VERY_HIGH']).optional(),
  riskCommitteeExists: z.boolean().optional(),
  riskCommitteeName: z.string().optional(),
  riskCommitteeMeetingFreq: z.string().optional(),
  boardReportingFreq: z.string().optional(),
  maturityLevel: z.string().optional(),
  maturityAssessedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
});

// GET /api/risks/appetite
router.get('/appetite', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const statements = await prisma.riskAppetiteStatement.findMany({
      where: { isActive: true, OR: [{ organisationId: orgId }, { organisationId: null }] },
      orderBy: { category: 'asc' },
      take: 1000});
    res.json({ success: true, data: statements });
  } catch (error: unknown) { logger.error('Failed to fetch appetite', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch appetite statements' } }); }
});

// POST /api/risks/appetite
router.post('/appetite', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = appetiteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = parsed.data.organisationId || ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.riskAppetiteStatement.findFirst({
      where: { category: parsed.data.category, organisationId: orgId },
    });
    let statement;
    if (existing) {
      statement = await prisma.riskAppetiteStatement.update({
        where: { id: existing.id },
        data: { ...parsed.data, organisationId: orgId, approvedAt: parsed.data.approvedBy ? new Date() : undefined },
      });
    } else {
      statement = await prisma.riskAppetiteStatement.create({
        data: { ...parsed.data, organisationId: orgId, approvedAt: parsed.data.approvedBy ? new Date() : undefined },
      });
    }
    res.status(existing ? 200 : 201).json({ success: true, data: statement });
  } catch (error: unknown) { logger.error('Failed to save appetite', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save appetite statement' } }); }
});

// GET /api/risks/framework
router.get('/framework', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const framework = await prisma.riskFramework.findUnique({ where: { organisationId: orgId } });
    res.json({ success: true, data: framework });
  } catch (error: unknown) { logger.error('Failed to fetch framework', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch framework' } }); }
});

// PUT /api/risks/framework
router.put('/framework', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = frameworkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.riskFramework.findUnique({ where: { organisationId: orgId } });
    let framework;
    if (existing) {
      framework = await prisma.riskFramework.update({ where: { organisationId: orgId }, data: parsed.data });
    } else {
      framework = await prisma.riskFramework.create({
        data: {
          ...parsed.data,
          organisationId: orgId,
          likelihoodScale: parsed.data.likelihoodScale || [
            { score: 1, label: 'Rare', description: 'May only occur in exceptional circumstances', freq: '<2% probability in 5 years' },
            { score: 2, label: 'Unlikely', description: 'Could occur but not expected', freq: '2-10% probability in 5 years' },
            { score: 3, label: 'Possible', description: 'Might occur at some time', freq: '10-50% probability in 5 years' },
            { score: 4, label: 'Likely', description: 'Will probably occur', freq: '50-90% probability in 5 years' },
            { score: 5, label: 'Almost Certain', description: 'Expected to occur in most circumstances', freq: '>90% probability in 5 years' },
          ],
          consequenceScale: parsed.data.consequenceScale || [
            { score: 1, label: 'Negligible', description: 'No measurable impact', examples: ['Minor delay', 'Negligible cost'] },
            { score: 2, label: 'Minor', description: 'Small impact, easily remedied', examples: ['Short delay', 'Minor cost <£10k'] },
            { score: 3, label: 'Moderate', description: 'Significant impact requiring management intervention', examples: ['Project delay', 'Cost £10k-£100k'] },
            { score: 4, label: 'Major', description: 'Major impact, substantial loss', examples: ['Major project failure', 'Cost £100k-£1M', 'Serious injury'] },
            { score: 5, label: 'Catastrophic', description: 'Extreme impact, threatens viability', examples: ['Business failure', 'Cost >£1M', 'Death or permanent disability'] },
          ],
          riskLevelBands: parsed.data.riskLevelBands || [
            { min: 1, max: 3, level: 'LOW', colour: '#22C55E', action: 'Manage by routine procedures' },
            { min: 4, max: 6, level: 'MEDIUM', colour: '#EAB308', action: 'Management responsibility and monitoring' },
            { min: 8, max: 12, level: 'HIGH', colour: '#F59E0B', action: 'Senior management attention required' },
            { min: 15, max: 19, level: 'VERY_HIGH', colour: '#F97316', action: 'Executive/board notification' },
            { min: 20, max: 25, level: 'CRITICAL', colour: '#EF4444', action: 'Immediate action, board escalation' },
          ],
        },
      });
    }
    res.json({ success: true, data: framework });
  } catch (error: unknown) { logger.error('Failed to save framework', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save framework' } }); }
});

export default router;
