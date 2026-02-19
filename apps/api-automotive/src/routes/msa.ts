import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Helper: generate MSA reference number MSA-YYMM-XXXX
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `MSA-${yy}${mm}`;

  const count = await prisma.msaStudy.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST / - Create MSA study
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      studyType: z.enum([
        'GRR_CROSSED',
        'GRR_NESTED',
        'BIAS',
        'LINEARITY',
        'STABILITY',
        'ATTRIBUTE',
      ]),
      gageName: z.string().trim().min(1).max(200),
      gageId: z.string().trim().optional(),
      characteristic: z.string().trim().min(1).max(200),
      specification: z.string().trim().optional(),
      tolerance: z.string().trim().optional(),
      operatorCount: z.number().int().min(1),
      numParts: z.number().int().min(1).optional().default(10),
      numTrials: z.number().int().min(1).optional().default(3),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const study = await prisma.msaStudy.create({
      data: {
        refNumber,
        title: data.title,
        studyType: data.studyType,
        gageName: data.gageName,
        gageId: data.gageId,
        characteristic: data.characteristic,
        specification: data.specification,
        tolerance: data.tolerance,
        operatorCount: data.operatorCount,
        numParts: data.numParts,
        numTrials: data.numTrials,
        status: 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: study });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create MSA study error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create MSA study' },
    });
  }
});

// GET / - List MSA studies
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, studyType, result } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (studyType) where.studyType = studyType;
    if (result) where.result = result;

    const [studies, total] = await Promise.all([
      prisma.msaStudy.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.msaStudy.count({ where }),
    ]);

    res.json({
      success: true,
      data: studies,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List MSA studies error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list MSA studies' },
    });
  }
});

// GET /:id - Get MSA study with all measurements
router.get('/:id', checkOwnership(prisma.msaStudy), async (req: AuthRequest, res: Response) => {
  try {
    const study = await prisma.msaStudy.findUnique({
      where: { id: req.params.id },
      include: {
        measurements: { orderBy: [{ operator: 'asc' }, { partNumber: 'asc' }, { trial: 'asc' }] },
      },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'MSA study not found' } });
    }

    res.json({ success: true, data: study });
  } catch (error) {
    logger.error('Get MSA study error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get MSA study' },
    });
  }
});

// POST /:id/data - Enter measurement data
router.post('/:id/data', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify study exists
    const study = await prisma.msaStudy.findUnique({ where: { id } });
    if (!study || study.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'MSA study not found' } });
    }

    const schema = z.object({
      measurements: z
        .array(
          z.object({
            operator: z.string().trim().min(1).max(200),
            partNumber: z.number().int().min(1),
            trial: z.number().int().min(1),
            value: z.number(),
          })
        )
        .min(1),
    });

    const data = schema.parse(req.body);

    // Create all measurements in a transaction
    const measurements = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const m of data.measurements) {
        const measurement = await tx.msaMeasurement.create({
          data: {
            studyId: id,
            operator: m.operator,
            partNumber: m.partNumber,
            trial: m.trial,
            value: m.value,
          },
        });
        created.push(measurement);
      }

      // Update study status to DATA_COLLECTED
      await tx.msaStudy.update({
        where: { id },
        data: { status: 'DATA_COLLECTED' },
      });

      return created;
    });

    res.status(201).json({ success: true, data: measurements });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Enter MSA data error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enter measurement data' },
    });
  }
});

// GET /:id/results - Calculate GR&R results
router.get('/:id/results', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const study = await prisma.msaStudy.findUnique({
      where: { id },
      include: {
        measurements: { orderBy: [{ operator: 'asc' }, { partNumber: 'asc' }, { trial: 'asc' }] },
      },
    });

    if (!study || study.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'MSA study not found' } });
    }

    if (study.measurements.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_DATA', message: 'No measurement data available for analysis' },
      });
    }

    // For GRR_CROSSED type, perform full Gage R&R analysis
    if (study.studyType === 'GRR_CROSSED') {
      const measurements = study.measurements;

      // Group measurements by operator
      const operatorGroups: Record<string, typeof measurements> = {};
      for (const m of measurements) {
        if (!operatorGroups[m.operator]) operatorGroups[m.operator] = [];
        operatorGroups[m.operator].push(m);
      }

      // Group measurements by part
      const partGroups: Record<number, typeof measurements> = {};
      for (const m of measurements) {
        if (!partGroups[m.partNumber]) partGroups[m.partNumber] = [];
        partGroups[m.partNumber].push(m);
      }

      const operators = Object.keys(operatorGroups);
      const parts = Object.keys(partGroups).map(Number);
      const numOperators = operators.length;
      const numParts = parts.length;
      const numTrials = study.numTrials;

      // Calculate repeatability (Equipment Variation - EV)
      // EV = Range average * K1
      // K1 depends on number of trials
      const k1Table: Record<number, number> = { 2: 0.8862, 3: 0.5908, 4: 0.4857, 5: 0.4299 };
      const k1 = k1Table[numTrials] || 0.5908;

      // Calculate average range per operator per part
      let totalRange = 0;
      let rangeCount = 0;

      for (const op of operators) {
        for (const part of parts) {
          const trials = measurements.filter((m) => m.operator === op && m.partNumber === part);
          if (trials.length > 1) {
            const values = trials.map((t) => t.value);
            const range = Math.max(...values) - Math.min(...values);
            totalRange += range;
            rangeCount++;
          }
        }
      }

      const averageRange = rangeCount > 0 ? totalRange / rangeCount : 0;
      const ev = averageRange * k1; // Equipment Variation (Repeatability)

      // Calculate reproducibility (Appraiser Variation - AV)
      // AV based on operator averages
      const k2Table: Record<number, number> = { 2: 0.7071, 3: 0.5231 };
      const k2 = k2Table[numOperators] || 0.5231;

      const operatorAverages: number[] = [];
      for (const op of operators) {
        const opMeasurements = operatorGroups[op];
        const avg = opMeasurements.reduce((sum, m) => sum + m.value, 0) / opMeasurements.length;
        operatorAverages.push(avg);
      }

      const xDiff = Math.max(...operatorAverages) - Math.min(...operatorAverages);
      const avSquared = Math.max(0, (xDiff * k2) ** 2 - ev ** 2 / (numParts * numTrials));
      const av = Math.sqrt(avSquared); // Appraiser Variation (Reproducibility)

      // Total GR&R
      const grr = Math.sqrt(ev ** 2 + av ** 2);

      // Part Variation (PV)
      const k3Table: Record<number, number> = {
        2: 0.7071,
        3: 0.5231,
        4: 0.4467,
        5: 0.403,
        6: 0.3742,
        7: 0.3534,
        8: 0.3375,
        9: 0.3249,
        10: 0.3146,
      };
      const k3 = k3Table[numParts] || 0.3146;

      const partAverages: number[] = [];
      for (const part of parts) {
        const partMeasurements = partGroups[part];
        const avg = partMeasurements.reduce((sum, m) => sum + m.value, 0) / partMeasurements.length;
        partAverages.push(avg);
      }

      const rp = Math.max(...partAverages) - Math.min(...partAverages);
      const pv = rp * k3; // Part Variation

      // Total Variation
      const tv = Math.sqrt(grr ** 2 + pv ** 2);

      // GR&R percentage
      const grrPercent = tv > 0 ? (grr / tv) * 100 : 0;

      // Number of Distinct Categories (ndc)
      const ndc = grr > 0 ? Math.floor(1.41 * (pv / grr)) : 0;

      // Determine result
      let resultStr: string;
      if (grrPercent < 10) {
        resultStr = 'ACCEPTABLE';
      } else if (grrPercent <= 30) {
        resultStr = 'CONDITIONAL';
      } else {
        resultStr = 'UNACCEPTABLE';
      }

      // Update study with results
      await prisma.msaStudy.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          result: resultStr as any,
          grrPercent: Math.round(grrPercent * 100) / 100,
          ndc,
          ev: Math.round(ev * 100000) / 100000,
          av: Math.round(av * 100000) / 100000,
          grr: Math.round(grr * 100000) / 100000,
          pv: Math.round(pv * 100000) / 100000,
          tv: Math.round(tv * 100000) / 100000,
        },
      });

      res.json({
        success: true,
        data: {
          studyId: id,
          studyType: study.studyType,
          totalMeasurements: measurements.length,
          numOperators,
          numParts,
          numTrials,
          repeatability: {
            averageRange: Math.round(averageRange * 100000) / 100000,
            ev: Math.round(ev * 100000) / 100000,
          },
          reproducibility: {
            operatorDifference: Math.round(xDiff * 100000) / 100000,
            av: Math.round(av * 100000) / 100000,
          },
          gageRR: {
            grr: Math.round(grr * 100000) / 100000,
            grrPercent: Math.round(grrPercent * 100) / 100,
          },
          partVariation: {
            pv: Math.round(pv * 100000) / 100000,
          },
          totalVariation: {
            tv: Math.round(tv * 100000) / 100000,
          },
          ndc,
          result: resultStr,
        },
      });
    } else {
      // For other study types, return a simpler analysis
      const values = study.measurements.map((m) => m.value);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      await prisma.msaStudy.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      res.json({
        success: true,
        data: {
          studyId: id,
          studyType: study.studyType,
          totalMeasurements: values.length,
          statistics: {
            mean: Math.round(mean * 100000) / 100000,
            stdDev: Math.round(stdDev * 100000) / 100000,
            variance: Math.round(variance * 100000) / 100000,
            min,
            max,
            range: Math.round(range * 100000) / 100000,
          },
        },
      });
    }
  } catch (error) {
    logger.error('Calculate MSA results error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate MSA results' },
    });
  }
});

export default router;
