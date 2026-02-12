import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway');
const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// =============================================
// Types
// =============================================

interface FactorScore {
  name: string;
  label: string;
  score: number;
  weight: number;
}

interface StandardScore {
  code: string;
  label: string;
  score: number;
  status: 'RED' | 'AMBER' | 'GREEN';
  factors: FactorScore[];
  weight: number;
}

interface ComplianceScoresResponse {
  overall: {
    score: number;
    status: 'RED' | 'AMBER' | 'GREEN';
  };
  standards: StandardScore[];
  generatedAt: string;
}

// =============================================
// Configuration: baseline scores & factor weights
// =============================================

const STANDARD_DEFINITIONS = [
  {
    code: 'ISO_9001',
    label: 'ISO 9001:2015',
    weight: 1.0,
    factors: [
      { name: 'objectives_on_track', label: 'Quality Objectives On Track', weight: 0.30 },
      { name: 'open_ncs_ratio', label: 'Open NCs Ratio (low is good)', weight: 0.25 },
      { name: 'capa_closure_rate', label: 'CAPA Closure Rate', weight: 0.25 },
      { name: 'audit_findings_closed', label: 'Audit Findings Closed', weight: 0.20 },
    ],
  },
  {
    code: 'ISO_45001',
    label: 'ISO 45001:2018',
    weight: 1.0,
    factors: [
      { name: 'objectives_on_track', label: 'OHS Objectives On Track', weight: 0.25 },
      { name: 'incident_trend', label: 'Incident Trend (improving)', weight: 0.25 },
      { name: 'legal_compliance', label: 'Legal Compliance', weight: 0.30 },
      { name: 'capa_closure', label: 'CAPA Closure Rate', weight: 0.20 },
    ],
  },
  {
    code: 'ISO_14001',
    label: 'ISO 14001:2015',
    weight: 1.0,
    factors: [
      { name: 'objectives_on_track', label: 'Environmental Objectives On Track', weight: 0.25 },
      { name: 'incident_trend', label: 'Environmental Incident Trend', weight: 0.25 },
      { name: 'legal_compliance', label: 'Legal Compliance', weight: 0.30 },
      { name: 'capa_closure', label: 'CAPA Closure Rate', weight: 0.20 },
    ],
  },
  {
    code: 'IATF_16949',
    label: 'IATF 16949:2016',
    weight: 0.8,
    factors: [
      { name: 'apqp_completion', label: 'APQP Phase Completion', weight: 0.25 },
      { name: 'ppap_approvals', label: 'PPAP Approval Rate', weight: 0.25 },
      { name: 'lpa_pass_rate', label: 'Layered Process Audit Pass Rate', weight: 0.25 },
      { name: 'open_ncrs', label: 'Open NCR Resolution', weight: 0.25 },
    ],
  },
  {
    code: 'ISO_13485',
    label: 'ISO 13485:2016',
    weight: 0.8,
    factors: [
      { name: 'complaint_closure', label: 'Complaint Closure Rate', weight: 0.25 },
      { name: 'mdr_timeliness', label: 'MDR Reporting Timeliness', weight: 0.25 },
      { name: 'capa_closure', label: 'CAPA Closure Rate', weight: 0.25 },
      { name: 'pms_currency', label: 'Post-Market Surveillance Currency', weight: 0.25 },
    ],
  },
  {
    code: 'AS9100D',
    label: 'AS9100D',
    weight: 0.8,
    factors: [
      { name: 'fai_completion', label: 'FAI Completion Rate', weight: 0.25 },
      { name: 'config_control', label: 'Configuration Control Compliance', weight: 0.25 },
      { name: 'supplier_cert_status', label: 'Supplier Certification Status', weight: 0.25 },
      { name: 'ofi_closure', label: 'OFI Closure Rate', weight: 0.25 },
    ],
  },
];

// Configurable baseline scores (0-100) per factor
// These can be overridden by stored data or environment variables
const BASELINE_SCORES: Record<string, Record<string, number>> = {
  ISO_9001: {
    objectives_on_track: 88,
    open_ncs_ratio: 82,
    capa_closure_rate: 91,
    audit_findings_closed: 85,
  },
  ISO_45001: {
    objectives_on_track: 90,
    incident_trend: 78,
    legal_compliance: 95,
    capa_closure: 87,
  },
  ISO_14001: {
    objectives_on_track: 85,
    incident_trend: 82,
    legal_compliance: 92,
    capa_closure: 88,
  },
  IATF_16949: {
    apqp_completion: 76,
    ppap_approvals: 83,
    lpa_pass_rate: 79,
    open_ncrs: 81,
  },
  ISO_13485: {
    complaint_closure: 90,
    mdr_timeliness: 93,
    capa_closure: 86,
    pms_currency: 88,
  },
  AS9100D: {
    fai_completion: 82,
    config_control: 87,
    supplier_cert_status: 91,
    ofi_closure: 84,
  },
};

// =============================================
// Helper functions
// =============================================

function getTrafficLight(score: number): 'RED' | 'AMBER' | 'GREEN' {
  if (score < 70) return 'RED';
  if (score < 85) return 'AMBER';
  return 'GREEN';
}

function calculateStandardScore(
  standardCode: string,
  factorDefs: { name: string; label: string; weight: number }[],
  overrides?: Record<string, number>
): { score: number; factors: FactorScore[] } {
  const baselines = BASELINE_SCORES[standardCode] || {};
  const factors: FactorScore[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const factor of factorDefs) {
    // Use override if available, otherwise use baseline
    const score = overrides?.[factor.name] ?? baselines[factor.name] ?? 75;
    const clampedScore = Math.max(0, Math.min(100, score));

    factors.push({
      name: factor.name,
      label: factor.label,
      score: Math.round(clampedScore * 10) / 10,
      weight: factor.weight,
    });

    totalWeightedScore += clampedScore * factor.weight;
    totalWeight += factor.weight;
  }

  const score = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;

  return { score, factors };
}

// =============================================
// Routes
// =============================================

// GET /compliance-scores — Live compliance % per standard
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Parse optional overrides from query parameters
    // Format: ?override_ISO_9001_objectives_on_track=95&override_IATF_16949_apqp_completion=80
    const overrides: Record<string, Record<string, number>> = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith('override_') && typeof value === 'string') {
        const parts = key.replace('override_', '').split('_');
        // Find the standard code (could be multi-part like ISO_9001)
        let standardCode = '';
        let factorName = '';

        for (const def of STANDARD_DEFINITIONS) {
          if (key.replace('override_', '').startsWith(def.code + '_')) {
            standardCode = def.code;
            factorName = key.replace('override_', '').slice(def.code.length + 1);
            break;
          }
        }

        if (standardCode && factorName) {
          if (!overrides[standardCode]) overrides[standardCode] = {};
          overrides[standardCode][factorName] = parseFloat(value);
        }
      }
    }

    // Calculate scores for each standard
    const standards: StandardScore[] = STANDARD_DEFINITIONS.map(def => {
      const { score, factors } = calculateStandardScore(
        def.code,
        def.factors,
        overrides[def.code]
      );

      return {
        code: def.code,
        label: def.label,
        score,
        status: getTrafficLight(score),
        factors,
        weight: def.weight,
      };
    });

    // Calculate overall IMS score (weighted average across standards)
    let totalWeightedScore = 0;
    let totalWeight = 0;
    for (const std of standards) {
      totalWeightedScore += std.score * std.weight;
      totalWeight += std.weight;
    }
    const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;

    const response: ComplianceScoresResponse = {
      overall: {
        score: overallScore,
        status: getTrafficLight(overallScore),
      },
      standards,
      generatedAt: new Date().toISOString(),
    };

    logger.info('Compliance scores calculated', {
      overallScore,
      overallStatus: response.overall.status,
      standardCount: standards.length,
    });

    res.json({ success: true, data: response });
  } catch (error) {
    logger.error('Compliance scores error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate compliance scores' },
    });
  }
});

// GET /compliance-scores/standard/:code — Detailed breakdown for one standard
router.get('/standard/:code', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const def = STANDARD_DEFINITIONS.find(s => s.code === code);

    if (!def) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Standard ${code} not found` },
      });
    }

    const { score, factors } = calculateStandardScore(def.code, def.factors);

    const detail = {
      code: def.code,
      label: def.label,
      score,
      status: getTrafficLight(score),
      factors,
      weight: def.weight,
      thresholds: {
        red: '< 70%',
        amber: '70% - 84.9%',
        green: '>= 85%',
      },
    };

    res.json({ success: true, data: detail });
  } catch (error) {
    logger.error('Standard detail error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get standard detail' },
    });
  }
});

export default router;
