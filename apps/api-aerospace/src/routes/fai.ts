import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// AS9102 First Article Inspection — Interfaces
// ============================================

interface Part1Characteristic {
  charNumber: number;
  charName: string;
  nominal: string;
  tolerance: string;
  actual: string;
  pass: boolean;
}

interface Part2Document {
  docType: string;
  docNumber: string;
  revision: string;
  available: boolean;
}

interface Part3TestResult {
  testName: string;
  testMethod: string;
  requirement: string;
  result: string;
  pass: boolean;
}

// ============================================
// Reference Number Generator
// ============================================

async function generateFAIRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.firstArticleInspection.count({
    where: { refNumber: { startsWith: `FAI-${yymm}` } },
  });
  return `FAI-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createFAISchema = z.object({
  title: z.string().min(1, 'Title is required'),
  partNumber: z.string().min(1, 'Part number is required'),
  partName: z.string().min(1, 'Part name is required'),
  revision: z.string().min(1, 'Revision is required'),
  drawingNumber: z.string().optional(),
  customer: z.string().optional(),
  poNumber: z.string().optional(),
  faiType: z.enum(['FULL', 'PARTIAL', 'DELTA']).optional(),
});

const part1Schema = z.object({
  characteristics: z.array(
    z.object({
      charNumber: z.number().int().positive('Characteristic number must be a positive integer'),
      charName: z.string().min(1, 'Characteristic name is required'),
      nominal: z.string().min(1, 'Nominal value is required'),
      tolerance: z.string().min(1, 'Tolerance is required'),
      actual: z.string(),
      pass: z.boolean(),
    })
  ),
});

const part2Schema = z.object({
  documents: z.array(
    z.object({
      docType: z.string().min(1, 'Document type is required'),
      docNumber: z.string().min(1, 'Document number is required'),
      revision: z.string().min(1, 'Revision is required'),
      available: z.boolean(),
    })
  ),
});

const part3Schema = z.object({
  testResults: z.array(
    z.object({
      testName: z.string().min(1, 'Test name is required'),
      testMethod: z.string().min(1, 'Test method is required'),
      requirement: z.string().min(1, 'Requirement is required'),
      result: z.string(),
      pass: z.boolean(),
    })
  ),
});

const partialApprovalSchema = z.object({
  openItems: z
    .array(z.string().trim().min(1).max(200))
    .min(1, 'At least one open item is required'),
});

// ============================================
// Helper: Determine part status from data
// ============================================

function determinePart1Status(characteristics: Part1Characteristic[]): string {
  if (characteristics.length === 0) return 'NOT_STARTED';
  const filled = characteristics.filter((c) => c.actual.trim() !== '');
  if (filled.length === 0) return 'NOT_STARTED';
  if (filled.length === characteristics.length) return 'COMPLETED';
  return 'IN_PROGRESS';
}

function determinePart2Status(documents: Part2Document[]): string {
  if (documents.length === 0) return 'NOT_STARTED';
  const available = documents.filter((d) => d.available);
  if (available.length === 0) return 'NOT_STARTED';
  if (available.length === documents.length) return 'COMPLETED';
  return 'IN_PROGRESS';
}

function determinePart3Status(testResults: Part3TestResult[]): string {
  if (testResults.length === 0) return 'NOT_STARTED';
  const filled = testResults.filter((t) => t.result.trim() !== '');
  if (filled.length === 0) return 'NOT_STARTED';
  if (filled.length === testResults.length) return 'COMPLETED';
  return 'IN_PROGRESS';
}

// ============================================
// Helper: Safely parse JSON fields
// ============================================

function safeParseJSON<T>(value: string | null | undefined, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// ============================================
// ROUTES
// ============================================

// POST / — Create FAI
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createFAISchema.parse(req.body);
    const refNumber = await generateFAIRefNumber();

    const fai = await prisma.firstArticleInspection.create({
      data: {
        refNumber,
        title: data.title,
        partNumber: data.partNumber,
        partName: data.partName,
        revision: data.revision,
        drawingNumber: data.drawingNumber,
        customer: data.customer,
        poNumber: data.poNumber,
        faiType: data.faiType || 'FULL',
        status: 'PLANNING',
        part1Status: 'NOT_STARTED',
        part2Status: 'NOT_STARTED',
        part3Status: 'NOT_STARTED',
        createdBy: req.user?.email || req.user?.id || 'unknown',
      },
    });

    logger.info('FAI created', { refNumber, partNumber: data.partNumber });
    res.status(201).json({ success: true, data: fai });
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
    logger.error('Create FAI error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create first article inspection' },
    });
  }
});

// GET / — List FAIs with pagination
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, faiType, partNumber, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (faiType) where.faiType = faiType as any;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { partName: { contains: search as string, mode: 'insensitive' } },
        { customer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [fais, total] = await Promise.all([
      prisma.firstArticleInspection.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.firstArticleInspection.count({ where }),
    ]);

    res.json({
      success: true,
      data: fais,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List FAIs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list first article inspections' },
    });
  }
});

// GET /:id — Get FAI with parsed part data
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const fai = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });

    if (!fai || fai.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    // Parse JSON fields into typed arrays for the response
    const parsed = {
      ...fai,
      part1Characteristics: safeParseJSON<Part1Characteristic>(fai.part1Data, []),
      part2Documents: safeParseJSON<Part2Document>(fai.part2Data, []),
      part3TestResults: safeParseJSON<Part3TestResult>(fai.part3Data, []),
      openItems: safeParseJSON<string>(fai.openItems, []),
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    logger.error('Get FAI error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get first article inspection' },
    });
  }
});

// PUT /:id/part1 — Update Part 1 (Design Characteristics)
router.put('/:id/part1', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    if (existing.status === 'APPROVED' || existing.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot modify Part 1 when FAI status is ${existing.status}`,
        },
      });
    }

    const data = part1Schema.parse(req.body);
    const part1Status = determinePart1Status(data.characteristics);

    const fai = await prisma.firstArticleInspection.update({
      where: { id: req.params.id },
      data: {
        part1Data: JSON.stringify(data.characteristics),
        part1Status,
        status: existing.status === 'PLANNING' ? 'IN_PROGRESS' : existing.status,
      } as any,
    });

    logger.info('FAI Part 1 updated', {
      id: req.params.id,
      part1Status,
      characteristicCount: data.characteristics.length,
    });
    res.json({ success: true, data: fai });
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
    logger.error('Update FAI Part 1 error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update Part 1 design characteristics',
      },
    });
  }
});

// PUT /:id/part2 — Update Part 2 (Manufacturing Process Documentation)
router.put('/:id/part2', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    if (existing.status === 'APPROVED' || existing.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot modify Part 2 when FAI status is ${existing.status}`,
        },
      });
    }

    const data = part2Schema.parse(req.body);
    const part2Status = determinePart2Status(data.documents);

    const fai = await prisma.firstArticleInspection.update({
      where: { id: req.params.id },
      data: {
        part2Data: JSON.stringify(data.documents),
        part2Status,
        status: existing.status === 'PLANNING' ? 'IN_PROGRESS' : existing.status,
      } as any,
    });

    logger.info('FAI Part 2 updated', {
      id: req.params.id,
      part2Status,
      documentCount: data.documents.length,
    });
    res.json({ success: true, data: fai });
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
    logger.error('Update FAI Part 2 error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update Part 2 manufacturing process documentation',
      },
    });
  }
});

// PUT /:id/part3 — Update Part 3 (Test Results)
router.put('/:id/part3', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    if (existing.status === 'APPROVED' || existing.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot modify Part 3 when FAI status is ${existing.status}`,
        },
      });
    }

    const data = part3Schema.parse(req.body);
    const part3Status = determinePart3Status(data.testResults);

    const fai = await prisma.firstArticleInspection.update({
      where: { id: req.params.id },
      data: {
        part3Data: JSON.stringify(data.testResults),
        part3Status,
        status: existing.status === 'PLANNING' ? 'IN_PROGRESS' : existing.status,
      } as any,
    });

    logger.info('FAI Part 3 updated', {
      id: req.params.id,
      part3Status,
      testResultCount: data.testResults.length,
    });
    res.json({ success: true, data: fai });
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
    logger.error('Update FAI Part 3 error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update Part 3 test results' },
    });
  }
});

// POST /:id/approve — Full FAI approval
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    // Validate all 3 parts are COMPLETED
    const partStatuses = {
      part1: existing.part1Status,
      part2: existing.part2Status,
      part3: existing.part3Status,
    };

    const incompleteParts: string[] = [];
    if (partStatuses.part1 !== 'COMPLETED') incompleteParts.push('Part 1 (Design Characteristics)');
    if (partStatuses.part2 !== 'COMPLETED')
      incompleteParts.push('Part 2 (Manufacturing Process Documentation)');
    if (partStatuses.part3 !== 'COMPLETED') incompleteParts.push('Part 3 (Test Results)');

    if (incompleteParts.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PARTS_INCOMPLETE',
          message: `Cannot approve FAI. The following parts are not completed: ${incompleteParts.join(', ')}`,
        },
      });
    }

    // Validate all Part 1 characteristics pass
    const characteristics = safeParseJSON<Part1Characteristic>(existing.part1Data, []);
    const failedChars = characteristics.filter((c) => !c.pass);
    if (failedChars.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHARACTERISTICS_FAILED',
          message: `Cannot approve FAI. ${failedChars.length} characteristic(s) did not pass: ${failedChars.map((c) => `#${c.charNumber} ${c.charName}`).join(', ')}`,
        },
      });
    }

    // Validate all Part 3 test results pass
    const testResults = safeParseJSON<Part3TestResult>(existing.part3Data, []);
    const failedTests = testResults.filter((t) => !t.pass);
    if (failedTests.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TESTS_FAILED',
          message: `Cannot approve FAI. ${failedTests.length} test(s) did not pass: ${failedTests.map((t) => t.testName).join(', ')}`,
        },
      });
    }

    const fai = await prisma.firstArticleInspection.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user?.email || req.user?.id || 'unknown',
        approvedDate: new Date(),
      },
    });

    logger.info('FAI approved', {
      id: req.params.id,
      refNumber: existing.refNumber,
      approvedBy: fai.approvedBy,
    });
    res.json({ success: true, data: fai });
  } catch (error) {
    logger.error('Approve FAI error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve first article inspection' },
    });
  }
});

// POST /:id/partial — Mark as Partial FAI with open items
router.post('/:id/partial', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.firstArticleInspection.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'First article inspection not found' },
      });
    }

    const data = partialApprovalSchema.parse(req.body);

    const fai = await prisma.firstArticleInspection.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED_PARTIAL',
        openItems: JSON.stringify(data.openItems),
        approvedBy: req.user?.email || req.user?.id || 'unknown',
        approvedDate: new Date(),
      },
    });

    logger.info('FAI partial approval', {
      id: req.params.id,
      refNumber: existing.refNumber,
      openItemCount: data.openItems.length,
    });
    res.json({ success: true, data: fai });
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
    logger.error('Partial approve FAI error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to partially approve first article inspection',
      },
    });
  }
});

export default router;
