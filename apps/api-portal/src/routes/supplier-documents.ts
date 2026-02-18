import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const documentUploadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  fileName: z.string().trim().min(1).max(500),
  fileSize: z.number().int().positive(),
  mimeType: z.string().trim().min(1).max(100),
  category: z.enum(['CONTRACT', 'CERTIFICATE', 'REPORT', 'SPECIFICATION', 'MANUAL', 'OTHER']),
  tags: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// POST / — Upload a document
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = documentUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    const document = await prisma.portalDocument.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        category: data.category,
        uploadedBy: auth.user!.id,
        portalType: 'SUPPLIER',
        visibility: 'SHARED',
        tags: data.tags ?? undefined,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Supplier document uploaded', { id: document.id, title: document.title });
    return res.status(201).json({ success: true, data: document });
  } catch (error: unknown) {
    logger.error('Error uploading document', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to upload document' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List own documents
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where: Record<string, unknown> = {
      uploadedBy: auth.user!.id,
      portalType: 'SUPPLIER',
      deletedAt: null,
    };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.portalDocument.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalDocument.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing supplier documents', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' } });
  }
});

export default router;
