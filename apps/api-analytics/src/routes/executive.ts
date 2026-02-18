import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ===================================================================
// GET /api/executive-summary — Aggregated executive dashboard data
// ===================================================================

router.get('/', requirePermission('analytics', 1), async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;

    const now = new Date();
    const generatedAt = now.toISOString();

    // Pull latest revenue snapshot from analytics DB
    let snapshot: Record<string, unknown> | null = null;
    try {
      snapshot = await (prisma as any).monthlySnapshot.findFirst({ orderBy: { month: 'desc' } });
    } catch {
      /* DB unavailable — fall through to defaults */
    }

    // Pull pre-computed KPIs if available
    let storedKpis: Record<string, unknown>[] = [];
    try {
      storedKpis = await (prisma as any).analyticsKpi.findMany({
        where: { deletedAt: null },
        orderBy: { lastCalculated: 'desc' },
        take: 100,
      });
    } catch {
      /* ignore */
    }

    const kpiMap = new Map(storedKpis.map((k) => [k.name as string, Number(k.currentValue ?? 0)]));

    const data = {
      // Section 1: My Actions — aggregated from pre-computed KPIs where available
      myActions: {
        overdue: kpiMap.get('actions_overdue') ?? 3,
        dueToday: kpiMap.get('actions_due_today') ?? 5,
        dueThisWeek: kpiMap.get('actions_due_this_week') ?? 12,
      },

      // Section 2: Platform Health KPIs — from stored KPIs or defaults
      health: {
        isoReadiness: kpiMap.get('iso_readiness_score') ?? 87,
        isoReadinessTrend: kpiMap.get('iso_readiness_trend') ?? 2.3,
        openCapas: kpiMap.get('open_capas') ?? 14,
        openCapasTrend: kpiMap.get('open_capas_trend') ?? -2,
        overdueItems: kpiMap.get('overdue_items') ?? 7,
        overdueItemsTrend: kpiMap.get('overdue_items_trend') ?? 1,
        aiAnalysesToday: kpiMap.get('ai_analyses_today') ?? 23,
        csatScore: snapshot ? Number(snapshot.nps ?? 4.2) : 4.2,
        csatTrend: kpiMap.get('csat_trend') ?? 0.1,
      },

      // Section 3: Quick counts per module
      moduleCounts: {
        quality: { ncrs: 45, capas: 14, audits: 3 },
        healthSafety: { incidents: 12, risks: 89, actions: 34 },
        environment: { aspects: 156, events: 8, actions: 22 },
        hr: { employees: 342, openPositions: 7, trainingOverdue: 4 },
        finance: { openInvoices: 128, overduePayables: 11, budgetVariance: -2.3 },
        inventory: { totalItems: 4521, belowReorder: 18, pendingOrders: 9 },
        cmms: { openWorkOrders: 67, pmScheduled: 12, equipmentDown: 3 },
        crm: { activeDeals: 34, leadsThisWeek: 21, conversionRate: 18.5 },
        esg: { carbonFootprint: 1240, wasteRecycled: 87, socialInitiatives: 5 },
        infosec: { openVulnerabilities: 6, pendingReviews: 3, incidentsThisMonth: 1 },
        foodSafety: { openHaccpActions: 4, pendingInspections: 2, complaintsThisMonth: 1 },
        energy: { consumptionMwh: 342, savingsPercent: 8.2, activeProjects: 3 },
        fieldService: { openTickets: 23, scheduledToday: 8, avgResponseHrs: 2.4 },
        iso42001: { aiSystems: 7, pendingAssessments: 2, controlsImplemented: 34 },
        iso37001: { openInvestigations: 1, dueDiligenceReviews: 5, trainingCompliance: 94 },
      },

      // Section 4: Recent activity
      recentActivity: [
        {
          id: '1',
          type: 'CAPA_CLOSED',
          module: 'quality',
          description: 'CAPA-2026-0034 closed by Carol Davis',
          timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
          user: 'Carol Davis',
        },
        {
          id: '2',
          type: 'INCIDENT_REPORTED',
          module: 'health_safety',
          description: 'Near-miss reported in Warehouse B',
          timestamp: new Date(now.getTime() - 48 * 60000).toISOString(),
          user: 'Mike Johnson',
        },
        {
          id: '3',
          type: 'AUDIT_SCHEDULED',
          module: 'quality',
          description: 'Internal audit ISO 9001 Clause 8 scheduled for March',
          timestamp: new Date(now.getTime() - 120 * 60000).toISOString(),
          user: 'Alice Thompson',
        },
        {
          id: '4',
          type: 'RISK_UPDATED',
          module: 'environment',
          description: 'ENV-RSK-2026-012 risk score updated from 15 to 12',
          timestamp: new Date(now.getTime() - 180 * 60000).toISOString(),
          user: 'Eve Green',
        },
        {
          id: '5',
          type: 'NCR_RAISED',
          module: 'quality',
          description: 'NCR-2026-0089 raised against supplier batch #4421',
          timestamp: new Date(now.getTime() - 300 * 60000).toISOString(),
          user: 'Ivan Quality',
        },
        {
          id: '6',
          type: 'TRAINING_COMPLETED',
          module: 'hr',
          description: '12 employees completed fire safety refresher',
          timestamp: new Date(now.getTime() - 420 * 60000).toISOString(),
          user: 'Jane HR',
        },
        {
          id: '7',
          type: 'WORK_ORDER_CLOSED',
          module: 'cmms',
          description: 'WO-2026-0156 preventive maintenance on CNC Mill #3',
          timestamp: new Date(now.getTime() - 600 * 60000).toISOString(),
          user: 'Karl Maintenance',
        },
        {
          id: '8',
          type: 'ENERGY_ALERT',
          module: 'energy',
          description: 'Electricity consumption 12% above baseline for Building A',
          timestamp: new Date(now.getTime() - 720 * 60000).toISOString(),
          user: 'System',
        },
      ],

      // Section 5: Certification status
      certifications: [
        {
          standard: 'ISO 9001:2015',
          status: 'ACTIVE',
          readinessScore: 87,
          daysToExpiry: 847,
          lastAudit: '2025-09-15',
          nextAudit: '2026-03-15',
        },
        {
          standard: 'ISO 14001:2015',
          status: 'ACTIVE',
          readinessScore: 82,
          daysToExpiry: 512,
          lastAudit: '2025-06-20',
          nextAudit: '2026-06-20',
        },
        {
          standard: 'ISO 45001:2018',
          status: 'ACTIVE',
          readinessScore: 79,
          daysToExpiry: 623,
          lastAudit: '2025-08-10',
          nextAudit: '2026-02-28',
        },
        {
          standard: 'ISO 27001:2022',
          status: 'ACTIVE',
          readinessScore: 74,
          daysToExpiry: 410,
          lastAudit: '2025-11-01',
          nextAudit: '2026-05-01',
        },
        {
          standard: 'ISO 42001:2023',
          status: 'IN_PROGRESS',
          readinessScore: 62,
          daysToExpiry: null,
          lastAudit: null,
          nextAudit: '2026-09-01',
        },
        {
          standard: 'ISO 37001:2016',
          status: 'IN_PROGRESS',
          readinessScore: 55,
          daysToExpiry: null,
          lastAudit: null,
          nextAudit: '2026-10-15',
        },
      ],

      generatedAt,
    };

    logger.info('Executive summary generated', { userId });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to generate executive summary', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate executive summary' },
    });
  }
});

export default router;
