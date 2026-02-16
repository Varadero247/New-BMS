import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-analytics');

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);

    const [
      activePremises,
      fraOverdueCount,
      activeIncidents,
      incidentsLast30Days,
      wardenTrainingExpiring,
      peepReviewDue,
      equipmentServiceDue,
      bcpCount,
      bcpNotTestedCount,
      recentIncidents,
      riskLevelBreakdown,
      incidentTypeBreakdown,
      premisesWithNoDrill,
    ] = await Promise.all([
      (prisma as any).femPremises.count({ where: { organisationId: orgId, isActive: true } }),
      (prisma as any).femFireRiskAssessment.count({ where: { organisationId: orgId, deletedAt: null, nextReviewDate: { lt: now } } }),
      (prisma as any).femEmergencyIncident.count({ where: { organisationId: orgId, status: { in: ['ACTIVE', 'ELEVATED', 'CONTAINED'] } } }),
      (prisma as any).femEmergencyIncident.count({ where: { organisationId: orgId, reportedAt: { gte: thirtyDaysAgo } } }),
      (prisma as any).femFireWarden.count({ where: { isActive: true, trainingExpiryDate: { lt: thirtyDaysFromNow } } }),
      (prisma as any).femPeep.count({ where: { isActive: true, reviewDate: { lt: now } } }),
      (prisma as any).femEmergencyEquipment.count({ where: { nextServiceDue: { lt: thirtyDaysFromNow } } }),
      (prisma as any).femBusinessContinuityPlan.count({ where: { organisationId: orgId } }),
      (prisma as any).femBusinessContinuityPlan.count({ where: { organisationId: orgId, OR: [{ lastTestedDate: null }, { lastTestedDate: { lt: twelveMonthsAgo } }] } }),
      (prisma as any).femEmergencyIncident.findMany({ where: { organisationId: orgId }, orderBy: { reportedAt: 'desc' }, take: 5, include: { premises: { select: { name: true } } } }),
      (prisma as any).femFireRiskAssessment.groupBy({ by: ['overallRiskLevel'], _count: true, where: { organisationId: orgId, deletedAt: null } }),
      (prisma as any).femEmergencyIncident.groupBy({ by: ['emergencyType'], _count: true, where: { organisationId: orgId } }),
      (prisma as any).femPremises.count({ where: { organisationId: orgId, isActive: true, drillRecords: { none: { drillDate: { gte: sixMonthsAgo } } } } }),
    ]);

    // Build critical alerts
    const criticalAlerts: string[] = [];
    if (activeIncidents > 0) criticalAlerts.push(`${activeIncidents} active emergency incident(s)`);
    if (fraOverdueCount > 0) criticalAlerts.push(`${fraOverdueCount} fire risk assessment(s) overdue`);
    if (wardenTrainingExpiring > 0) criticalAlerts.push(`${wardenTrainingExpiring} warden(s) with training expiring`);
    if (equipmentServiceDue > 0) criticalAlerts.push(`${equipmentServiceDue} equipment item(s) need servicing`);
    if (premisesWithNoDrill > 0) criticalAlerts.push(`${premisesWithNoDrill} premises with no drill in 6 months`);

    res.json({
      success: true,
      data: {
        activePremises,
        fraOverdueCount,
        activeIncidents,
        incidentsLast30Days,
        wardenTrainingExpiring,
        peepReviewDue,
        equipmentServiceDue,
        drillsDueSoon: premisesWithNoDrill,
        bcpCount,
        bcpNotTestedCount,
        riskLevelBreakdown: Object.fromEntries(riskLevelBreakdown.map((r: any) => [r.overallRiskLevel, r._count])),
        incidentTypeBreakdown: Object.fromEntries(incidentTypeBreakdown.map((r: any) => [r.emergencyType, r._count])),
        recentIncidents,
        criticalAlerts,
      },
    });
  } catch (error: any) { logger.error('Failed to fetch analytics dashboard', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch analytics dashboard' } }); }
});

export default router;
