import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-inventory');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/suppliers - List suppliers
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status, isActive } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    res.json({
      success: true,
      data: suppliers,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List suppliers error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list suppliers' },
    });
  }
});

// GET /api/suppliers/:id - Get single supplier
router.get('/:id', checkOwnership(prisma.supplier), async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          take: 10,
          select: { id: true, sku: true, name: true, status: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Get supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get supplier' },
    });
  }
});

// POST /api/suppliers - Create supplier
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      contactName: z.string().optional(),
      email: z.string().trim().email().optional(),
      phone: z.string().optional(),
      website: z.string().trim().url().optional(),
      address: z.record(z.unknown()).optional(),
      paymentTerms: z.string().optional(),
      currency: z.string().length(3).default('USD'),
      taxId: z.string().optional(),
      notes: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
    });

    const data = schema.parse(req.body);

    // Check for duplicate code
    const existingCode = await prisma.supplier.findUnique({ where: { code: data.code } });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_CODE', message: 'Supplier code already exists' },
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        id: uuidv4(),
        ...data,
        status: 'ACTIVE',
        isActive: true,
        createdById: req.user?.id,
        updatedById: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: supplier });
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
    logger.error('Create supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' },
    });
  }
});

// PATCH /api/suppliers/:id - Update supplier
router.patch('/:id', checkOwnership(prisma.supplier), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    const schema = z.object({
      code: z.string().trim().min(1).max(200).optional(),
      name: z.string().trim().min(1).max(200).optional(),
      contactName: z.string().optional().nullable(),
      email: z.string().trim().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      website: z.string().trim().url().optional().nullable(),
      address: z.record(z.unknown()).optional(),
      paymentTerms: z.string().optional().nullable(),
      currency: z.string().length(3).optional(),
      taxId: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      rating: z.number().min(0).max(5).optional().nullable(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']).optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Check for duplicate code if changing
    if (data.code && data.code !== existing.code) {
      const existingCode = await prisma.supplier.findUnique({ where: { code: data.code } });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_CODE', message: 'Supplier code already exists' },
        });
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        ...data,
        updatedById: req.user?.id,
      } as any,
    });

    res.json({ success: true, data: supplier });
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
    logger.error('Update supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' },
    });
  }
});

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', checkOwnership(prisma.supplier), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { products: { take: 1 } },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    // Check for products
    if (existing.products.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HAS_PRODUCTS',
          message: 'Cannot delete supplier with associated products. Reassign products first.',
        },
      });
    }

    await prisma.supplier.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete supplier error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' },
    });
  }
});

export default router;
