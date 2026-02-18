import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnomalyAlert {
  id: string;
  kpiName: string;
  module: string;
  detectedAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'DISMISSED' | 'RESOLVED';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  unit: string;
  recommendation: string;
  dismissedBy?: string;
  dismissedAt?: string;
  dismissReason?: string;
}

interface MonitoredKpi {
  id: string;
  name: string;
  module: string;
  currentValue: number;
  baselineValue: number;
  upperThreshold: number;
  lowerThreshold: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'ANOMALY';
  lastChecked: string;
  checkFrequency: string;
}

// ---------------------------------------------------------------------------
// Seed data — 8 anomaly alerts
// ---------------------------------------------------------------------------

const SEED_ANOMALIES: AnomalyAlert[] = [
  {
    id: 'anom-001',
    kpiName: 'NCR Rate',
    module: 'Quality',
    detectedAt: '2026-02-14T06:30:00Z',
    severity: 'HIGH',
    status: 'ACTIVE',
    description:
      'NCR rate spiked to 4.2% — 2.1x above the 30-day rolling average of 2.0%. Coincides with new supplier batch #4421.',
    expectedValue: 2.0,
    actualValue: 4.2,
    deviationPercent: 110,
    unit: '%',
    recommendation:
      'Investigate supplier batch #4421. Cross-reference with incoming inspection records. Consider temporary quarantine.',
  },
  {
    id: 'anom-002',
    kpiName: 'Incident Frequency Rate',
    module: 'Health & Safety',
    detectedAt: '2026-02-13T14:15:00Z',
    severity: 'CRITICAL',
    status: 'ACKNOWLEDGED',
    description:
      'Incident frequency rate reached 3.8 per 100k hours — above the 3.0 control limit. Three near-misses reported in Warehouse B within 48 hours.',
    expectedValue: 1.5,
    actualValue: 3.8,
    deviationPercent: 153,
    unit: 'per 100k hrs',
    recommendation:
      'Conduct immediate safety stand-down in Warehouse B. Review recent risk assessments and safe systems of work.',
  },
  {
    id: 'anom-003',
    kpiName: 'Energy Consumption',
    module: 'Energy Management',
    detectedAt: '2026-02-13T08:00:00Z',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    description:
      'Building A electricity consumption 18% above baseline for the past 3 days. No production increase recorded.',
    expectedValue: 280,
    actualValue: 330,
    deviationPercent: 18,
    unit: 'kWh/day',
    recommendation:
      'Check HVAC scheduling and BMS setpoints for Building A. Inspect for equipment left running outside hours.',
  },
  {
    id: 'anom-004',
    kpiName: 'CAPA Closure Rate',
    module: 'Quality',
    detectedAt: '2026-02-12T16:00:00Z',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    description:
      'CAPA closure rate dropped to 68% — below the 85% target and 12 percentage points below the 6-month average.',
    expectedValue: 80,
    actualValue: 68,
    deviationPercent: -15,
    unit: '%',
    recommendation:
      'Review workload distribution among CAPA owners. Consider management escalation for CAPAs open >30 days.',
  },
  {
    id: 'anom-005',
    kpiName: 'Waste Diversion Rate',
    module: 'Environment',
    detectedAt: '2026-02-11T10:30:00Z',
    severity: 'LOW',
    status: 'DISMISSED',
    description:
      'Waste diversion rate dropped to 82% from 91% baseline. Attributed to construction waste from office renovation.',
    expectedValue: 91,
    actualValue: 82,
    deviationPercent: -10,
    unit: '%',
    recommendation:
      'Temporary deviation — ensure construction waste contractor provides recycling documentation.',
    dismissedBy: 'Eve Green',
    dismissedAt: '2026-02-11T14:00:00Z',
    dismissReason:
      'Known temporary deviation due to office renovation project. Will normalise in March.',
  },
  {
    id: 'anom-006',
    kpiName: 'Customer Satisfaction Score',
    module: 'CRM',
    detectedAt: '2026-02-10T09:00:00Z',
    severity: 'HIGH',
    status: 'ACTIVE',
    description:
      'CSAT score dropped from 4.2 to 3.6 in weekly survey. Negative sentiment concentrated around delivery times.',
    expectedValue: 4.2,
    actualValue: 3.6,
    deviationPercent: -14,
    unit: 'score (1-5)',
    recommendation:
      'Analyse delivery performance data. Cross-reference with logistics provider SLAs. Escalate to operations.',
  },
  {
    id: 'anom-007',
    kpiName: 'Login Failure Rate',
    module: 'Information Security',
    detectedAt: '2026-02-14T02:15:00Z',
    severity: 'HIGH',
    status: 'ACTIVE',
    description:
      'Login failure rate spiked to 340 failed attempts/hour between 02:00-03:00. Possible brute force attempt.',
    expectedValue: 12,
    actualValue: 340,
    deviationPercent: 2733,
    unit: 'failures/hr',
    recommendation:
      'Review source IPs. Consider temporary IP blocking. Verify account lockout policy is active.',
  },
  {
    id: 'anom-008',
    kpiName: 'Equipment OEE',
    module: 'CMMS',
    detectedAt: '2026-02-12T07:45:00Z',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    description:
      'CNC Mill #3 OEE dropped to 52% from 85% baseline. Caused by tool change delays and spindle vibration.',
    expectedValue: 85,
    actualValue: 52,
    deviationPercent: -39,
    unit: '%',
    recommendation:
      'Spindle bearing inspection completed. Tool change procedure updated. OEE recovering.',
  },
];

// ---------------------------------------------------------------------------
// Seed monitored KPIs
// ---------------------------------------------------------------------------

const SEED_MONITORED_KPIS: MonitoredKpi[] = [
  {
    id: 'mkpi-001',
    name: 'NCR Rate',
    module: 'Quality',
    currentValue: 4.2,
    baselineValue: 2.0,
    upperThreshold: 3.0,
    lowerThreshold: 0.5,
    unit: '%',
    status: 'ANOMALY',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-002',
    name: 'Incident Frequency Rate',
    module: 'Health & Safety',
    currentValue: 3.8,
    baselineValue: 1.5,
    upperThreshold: 3.0,
    lowerThreshold: 0,
    unit: 'per 100k hrs',
    status: 'ANOMALY',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-003',
    name: 'CAPA Closure Rate',
    module: 'Quality',
    currentValue: 68,
    baselineValue: 80,
    upperThreshold: 100,
    lowerThreshold: 75,
    unit: '%',
    status: 'WARNING',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-004',
    name: 'Energy Consumption (Bldg A)',
    module: 'Energy',
    currentValue: 330,
    baselineValue: 280,
    upperThreshold: 310,
    lowerThreshold: 200,
    unit: 'kWh/day',
    status: 'ANOMALY',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-005',
    name: 'Customer Satisfaction',
    module: 'CRM',
    currentValue: 3.6,
    baselineValue: 4.2,
    upperThreshold: 5.0,
    lowerThreshold: 3.8,
    unit: 'score',
    status: 'ANOMALY',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'WEEKLY',
  },
  {
    id: 'mkpi-006',
    name: 'On-Time Delivery',
    module: 'Operations',
    currentValue: 93,
    baselineValue: 95,
    upperThreshold: 100,
    lowerThreshold: 90,
    unit: '%',
    status: 'NORMAL',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-007',
    name: 'Training Compliance',
    module: 'HR',
    currentValue: 96,
    baselineValue: 95,
    upperThreshold: 100,
    lowerThreshold: 90,
    unit: '%',
    status: 'NORMAL',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'WEEKLY',
  },
  {
    id: 'mkpi-008',
    name: 'Equipment OEE',
    module: 'CMMS',
    currentValue: 78,
    baselineValue: 85,
    upperThreshold: 95,
    lowerThreshold: 75,
    unit: '%',
    status: 'WARNING',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'DAILY',
  },
  {
    id: 'mkpi-009',
    name: 'Waste Diversion Rate',
    module: 'Environment',
    currentValue: 89,
    baselineValue: 91,
    upperThreshold: 100,
    lowerThreshold: 85,
    unit: '%',
    status: 'NORMAL',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'WEEKLY',
  },
  {
    id: 'mkpi-010',
    name: 'Supplier Quality Index',
    module: 'Quality',
    currentValue: 87,
    baselineValue: 92,
    upperThreshold: 100,
    lowerThreshold: 85,
    unit: '%',
    status: 'WARNING',
    lastChecked: '2026-02-14T06:30:00Z',
    checkFrequency: 'MONTHLY',
  },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const dismissSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

// ===================================================================
// GET /api/anomalies/kpis — Monitored KPIs with current status
// ===================================================================

router.get('/kpis', requirePermission('analytics', 1), async (_req: Request, res: Response) => {
  try {
    const anomalyCount = SEED_MONITORED_KPIS.filter((k) => k.status === 'ANOMALY').length;
    const warningCount = SEED_MONITORED_KPIS.filter((k) => k.status === 'WARNING').length;
    const normalCount = SEED_MONITORED_KPIS.filter((k) => k.status === 'NORMAL').length;

    res.json({
      success: true,
      data: {
        kpis: SEED_MONITORED_KPIS,
        summary: {
          total: SEED_MONITORED_KPIS.length,
          anomaly: anomalyCount,
          warning: warningCount,
          normal: normalCount,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list monitored KPIs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list monitored KPIs' },
    });
  }
});

// ===================================================================
// GET /api/anomalies — List recent anomaly alerts
// ===================================================================

router.get('/', requirePermission('analytics', 1), async (req: Request, res: Response) => {
  try {
    const { severity, status, module } = req.query;

    let filtered = [...SEED_ANOMALIES];

    if (typeof severity === 'string' && severity.length > 0) {
      filtered = filtered.filter((a) => a.severity === severity);
    }
    if (typeof status === 'string' && status.length > 0) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (typeof module === 'string' && module.length > 0) {
      filtered = filtered.filter((a) => a.module.toLowerCase().includes(module.toLowerCase()));
    }

    const activeCount = SEED_ANOMALIES.filter((a) => a.status === 'ACTIVE').length;
    const criticalCount = SEED_ANOMALIES.filter(
      (a) => a.severity === 'CRITICAL' && a.status !== 'DISMISSED' && a.status !== 'RESOLVED'
    ).length;

    res.json({
      success: true,
      data: {
        anomalies: filtered,
        summary: {
          total: SEED_ANOMALIES.length,
          active: activeCount,
          critical: criticalCount,
          acknowledged: SEED_ANOMALIES.filter((a) => a.status === 'ACKNOWLEDGED').length,
          dismissed: SEED_ANOMALIES.filter((a) => a.status === 'DISMISSED').length,
          resolved: SEED_ANOMALIES.filter((a) => a.status === 'RESOLVED').length,
        },
      },
      pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
    });
  } catch (error: unknown) {
    logger.error('Failed to list anomalies', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list anomalies' },
    });
  }
});

// ===================================================================
// PUT /api/anomalies/:id/dismiss — Dismiss an anomaly alert
// ===================================================================

router.put(
  '/:id/dismiss',
  requirePermission('analytics', 3),
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const { id } = req.params;

      const parsed = dismissSchema.safeParse(req.body);
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

      // Try DB-backed alert first (real UUID records from monitoring system)
      let dbAlert: Record<string, unknown> | null = null;
      try {
        dbAlert = await (prisma as any).analyticsAlert.findUnique({ where: { id } });
      } catch {
        /* DB unavailable or model mismatch — fall through to seed data */
      }

      if (dbAlert) {
        if (dbAlert.status === 'RESOLVED') {
          return res.status(400).json({
            success: false,
            error: { code: 'ALREADY_DISMISSED', message: 'Anomaly alert already dismissed' },
          });
        }
        const now = new Date().toISOString();
        await (prisma as any).analyticsAlert.update({
          where: { id },
          data: {
            status: 'RESOLVED',
            acknowledgedBy: authReq.user!.id,
            notificationChannels: { dismissedAt: now, dismissReason: parsed.data.reason },
          },
        });
        const dismissed: AnomalyAlert = {
          id: dbAlert.id as string,
          kpiName: dbAlert.name as string,
          module: dbAlert.metric as string,
          detectedAt: (dbAlert.triggeredAt as Date | null)?.toISOString() ?? now,
          severity: 'MEDIUM',
          status: 'DISMISSED',
          description: '',
          expectedValue: Number(dbAlert.threshold ?? 0),
          actualValue: Number(dbAlert.currentValue ?? 0),
          deviationPercent: 0,
          unit: '',
          recommendation: '',
          dismissedBy: authReq.user!.id,
          dismissedAt: now,
          dismissReason: parsed.data.reason,
        };
        logger.info('Anomaly dismissed (DB)', { id, userId: authReq.user!.id });
        return res.json({ success: true, data: dismissed });
      }

      // Fall back to in-memory seed data
      const anomaly = SEED_ANOMALIES.find((a) => a.id === id);
      if (!anomaly) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Anomaly alert not found' },
        });
      }

      if (anomaly.status === 'DISMISSED') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_DISMISSED', message: 'Anomaly alert already dismissed' },
        });
      }

      const dismissed: AnomalyAlert = {
        ...anomaly,
        status: 'DISMISSED',
        dismissedBy: authReq.user!.id,
        dismissedAt: new Date().toISOString(),
        dismissReason: parsed.data.reason,
      };

      logger.info('Anomaly dismissed', {
        id,
        userId: authReq.user!.id,
        reason: parsed.data.reason,
      });

      res.json({ success: true, data: dismissed });
    } catch (error: unknown) {
      logger.error('Failed to dismiss anomaly', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to dismiss anomaly' },
      });
    }
  }
);

export default router;
