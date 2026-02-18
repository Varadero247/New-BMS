import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  calculateUKTax,
  calculateUSFederalTax,
  calculateAUTax,
  calculateCAFederalTax,
  calculateUAEGratuity,
  calculateDETax,
  calculateNLTax,
} from './tax-calculator';

const logger = createLogger('api-payroll');

const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Built-in jurisdiction tax rule data
// ---------------------------------------------------------------------------

const JURISDICTION_RULES: Record<string, object> = {
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    incomeTax: { rate: 0, description: 'No personal income tax' },
    socialSecurity: {
      employee: 0,
      employer: 0.125,
      description: '12.5% employer for UAE nationals only',
    },
    wps: { required: true, description: 'Wage Protection System compliance required' },
    gratuity: {
      first5Years: 21,
      after5Years: 30,
      unit: 'days per year',
      description: 'End of Service Gratuity: 21 days/yr first 5 years, 30 days/yr after',
    },
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    incomeTax: {
      personalAllowance: 12570,
      bands: [
        { name: 'Basic', rate: 0.2, from: 0, to: 37700 },
        { name: 'Higher', rate: 0.4, from: 37700, to: 125140 },
        { name: 'Additional', rate: 0.45, from: 125140, to: null },
      ],
    },
    nationalInsurance: {
      class1Employee: { rate: 0.08, threshold: 12570, upperLimit: 50270 },
      class1Employer: { rate: 0.138, threshold: 9100 },
    },
    scottishRates: {
      bands: [
        { name: 'Starter', rate: 0.19, from: 0, to: 2162 },
        { name: 'Basic', rate: 0.2, from: 2162, to: 13118 },
        { name: 'Intermediate', rate: 0.21, from: 13118, to: 31092 },
        { name: 'Higher', rate: 0.42, from: 31092, to: 125140 },
        { name: 'Top', rate: 0.47, from: 125140, to: null },
      ],
    },
    pension: { employeeMin: 0.05, employerMin: 0.03 },
    salarySacrifice: ['pension', 'cycle_to_work', 'ev_scheme'],
    rti: { required: true, format: 'HMRC_RTI' },
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    incomeTax: {
      taxFreeThreshold: 18200,
      bands: [
        { name: 'Nil', rate: 0, from: 0, to: 18200 },
        { name: '19c', rate: 0.19, from: 18200, to: 45000 },
        { name: '32.5c', rate: 0.325, from: 45000, to: 120000 },
        { name: '37c', rate: 0.37, from: 120000, to: 180000 },
        { name: '45c', rate: 0.45, from: 180000, to: null },
      ],
    },
    superannuation: { rate: 0.115, description: '11.5% employer super guarantee' },
    medicareLevy: { rate: 0.02 },
    stp: { required: true, phase: 2, format: 'STP_PHASE_2' },
  },
  US: {
    code: 'US',
    name: 'United States',
    federalTax: {
      brackets: [
        { rate: 0.1, from: 0, to: 11600 },
        { rate: 0.12, from: 11600, to: 47150 },
        { rate: 0.22, from: 47150, to: 100525 },
        { rate: 0.24, from: 100525, to: 191950 },
        { rate: 0.32, from: 191950, to: 243725 },
        { rate: 0.35, from: 243725, to: 609350 },
        { rate: 0.37, from: 609350, to: null },
      ],
    },
    fica: {
      socialSecurity: { employeeRate: 0.062, employerRate: 0.062, wageBase: 168600 },
      medicare: { employeeRate: 0.0145, employerRate: 0.0145 },
      additionalMedicare: { rate: 0.009, threshold: 200000 },
    },
    futa: { rate: 0.06, wageBase: 7000 },
    stateTax: { configurable: true, description: 'Varies by state' },
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    federalTax: {
      basicPersonalAmount: 15705,
      bands: [
        { rate: 0.15, from: 0, to: 55867 },
        { rate: 0.205, from: 55867, to: 111733 },
        { rate: 0.26, from: 111733, to: 154906 },
        { rate: 0.29, from: 154906, to: 220000 },
        { rate: 0.33, from: 220000, to: null },
      ],
    },
    cpp: { rate: 0.0595, ympe: 68500, basicExemption: 3500 },
    ei: { employeeRate: 0.0166, employerRate: 0.02324, mie: 63200 },
    quebec: { qpp: true, qpip: true, description: 'QPP replaces CPP in Quebec' },
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    incomeTax: {
      progressiveFormula: true,
      solidaritySurcharge: 0.055,
      churchTax: { rate: 0.08, optional: true },
    },
    socialInsurance: {
      pension: { rate: 0.186, split: 'equal' },
      health: { rate: 0.146, split: 'equal', additionalRate: 0.017 },
      unemployment: { rate: 0.026, split: 'equal' },
      nursingCare: { rate: 0.034, split: 'equal' },
    },
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    incomeTax: {
      bands: [
        { rate: 0.3693, from: 0, to: 73031 },
        { rate: 0.495, from: 73031, to: null },
      ],
    },
    socialContributions: {
      zvw: { rate: 0.0657, employer: true },
      wia: { rate: 0.0768, employer: true },
      aof: { rate: 0.0768, employer: true },
    },
  },
};

// In-memory store for active jurisdictions (in production, would use DB)
const activeJurisdictions: Map<
  string,
  { code: string; name: string; activatedAt: string; status: string; customRules?: object }
> = new Map();

const SUPPORTED_CODES = Object.keys(JURISDICTION_RULES);

// ---------------------------------------------------------------------------
// POST /api/jurisdictions — Register jurisdiction for org
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().length(2).toUpperCase(),
      customRules: z.record(z.any()).optional(),
    });

    const data = schema.parse(req.body);
    const code = data.code.toUpperCase();

    if (!SUPPORTED_CODES.includes(code)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_JURISDICTION',
          message: `Jurisdiction ${code} is not supported. Supported: ${SUPPORTED_CODES.join(', ')}`,
        },
      });
    }

    if (activeJurisdictions.has(code)) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_ACTIVE', message: `Jurisdiction ${code} is already active` },
      });
    }

    const rules = JURISDICTION_RULES[code] as any;
    const jurisdiction = {
      code,
      name: rules.name,
      activatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      customRules: data.customRules,
    };

    activeJurisdictions.set(code, jurisdiction);

    logger.info('Jurisdiction registered', { code });
    res.status(201).json({ success: true, data: jurisdiction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error registering jurisdiction', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to register jurisdiction' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/jurisdictions — List active jurisdictions
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const jurisdictions = Array.from(activeJurisdictions.values());
    res.json({ success: true, data: jurisdictions });
  } catch (error) {
    logger.error('Error listing jurisdictions', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list jurisdictions' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/jurisdictions/:code/rules — Get tax rules for jurisdiction
// ---------------------------------------------------------------------------
router.get('/:code/rules', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();

    if (!SUPPORTED_CODES.includes(code)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Jurisdiction ${code} not found` },
      });
    }

    const rules = JURISDICTION_RULES[code];
    const active = activeJurisdictions.get(code);

    // Merge custom rules if jurisdiction is active and has overrides
    const mergedRules = active?.customRules
      ? { ...rules, customOverrides: active.customRules }
      : rules;

    res.json({ success: true, data: mergedRules });
  } catch (error) {
    logger.error('Error fetching jurisdiction rules', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rules' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/jurisdictions/:code/rules — Update jurisdiction rules (custom overrides)
// ---------------------------------------------------------------------------
router.put('/:code/rules', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();

    if (!SUPPORTED_CODES.includes(code)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Jurisdiction ${code} not found` },
      });
    }

    const schema = z.object({
      customRules: z.record(z.any()),
    });

    const data = schema.parse(req.body);

    const existing = activeJurisdictions.get(code);
    if (!existing) {
      // Auto-activate if not active
      const rules = JURISDICTION_RULES[code] as any;
      activeJurisdictions.set(code, {
        code,
        name: rules.name,
        activatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        customRules: data.customRules,
      });
    } else {
      existing.customRules = { ...(existing.customRules || {}), ...data.customRules };
      activeJurisdictions.set(code, existing);
    }

    const updatedRules = {
      ...JURISDICTION_RULES[code],
      customOverrides: activeJurisdictions.get(code)!.customRules,
    };

    logger.info('Jurisdiction rules updated', { code });
    res.json({ success: true, data: updatedRules });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating jurisdiction rules', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update rules' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/jurisdictions/:code — Deactivate jurisdiction
// ---------------------------------------------------------------------------
router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();

    if (!activeJurisdictions.has(code)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Active jurisdiction ${code} not found` },
      });
    }

    const jurisdiction = activeJurisdictions.get(code)!;
    jurisdiction.status = 'INACTIVE';
    activeJurisdictions.delete(code);

    logger.info('Jurisdiction deactivated', { code });
    res.json({ success: true, data: { ...jurisdiction, deactivatedAt: new Date().toISOString() } });
  } catch (error) {
    logger.error('Error deactivating jurisdiction', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to deactivate jurisdiction' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/jurisdictions/:code/calculate — Calculate tax for a jurisdiction
// ---------------------------------------------------------------------------
router.post('/:code/calculate', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();

    const schema = z.object({
      grossAnnual: z.number().positive().optional(),
      monthlySalary: z.number().positive().optional(),
      yearsOfService: z.number().min(0).optional(),
      isScottish: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    let result;
    switch (code) {
      case 'GB':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for UK calculation',
            },
          });
        result = calculateUKTax(data.grossAnnual, data.isScottish || false);
        break;
      case 'US':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for US calculation',
            },
          });
        result = calculateUSFederalTax(data.grossAnnual);
        break;
      case 'AU':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for AU calculation',
            },
          });
        result = calculateAUTax(data.grossAnnual);
        break;
      case 'CA':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for CA calculation',
            },
          });
        result = calculateCAFederalTax(data.grossAnnual);
        break;
      case 'AE':
        if (!data.monthlySalary || data.yearsOfService === undefined) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'monthlySalary and yearsOfService are required for UAE calculation',
            },
          });
        }
        result = {
          gratuity: calculateUAEGratuity(data.monthlySalary, data.yearsOfService),
          incomeTax: 0,
          description: 'UAE has no personal income tax. Gratuity calculated per UAE Labour Law.',
        };
        break;
      case 'DE':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for DE calculation',
            },
          });
        result = calculateDETax(data.grossAnnual);
        break;
      case 'NL':
        if (!data.grossAnnual)
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'grossAnnual is required for NL calculation',
            },
          });
        result = calculateNLTax(data.grossAnnual);
        break;
      default:
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Tax calculation not available for ${code}` },
        });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error calculating tax', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate tax' },
    });
  }
});

export default router;

// Export for testing
export { activeJurisdictions, JURISDICTION_RULES, SUPPORTED_CODES };
