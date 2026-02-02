import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/suppliers - List suppliers
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status, isActive } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
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
    console.error('List suppliers error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list suppliers' } });
  }
});

// GET /api/suppliers/:id - Get single supplier
router.get('/:id', async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get supplier' } });
  }
});

// POST /api/suppliers - Create supplier
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      contactName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      address: z.any().optional(),
      paymentTerms: z.string().optional(),
      currency: z.string().default('USD'),
      taxId: z.string().optional(),
      notes: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
    });

    const data = schema.parse(req.body);

    // Check for duplicate code
    const existingCode = await prisma.supplier.findUnique({ where: { code: data.code } });
    if (existingCode) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Supplier code already exists' } });
    }

    const supplier = await prisma.supplier.create({
      data: {
        id: uuidv4(),
        ...data,
        status: 'ACTIVE',
        isActive: true,
        createdById: req.user?.id,
        updatedById: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' } });
  }
});

// PATCH /api/suppliers/:id - Update supplier
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    const schema = z.object({
      code: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      contactName: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      website: z.string().url().optional().nullable(),
      address: z.any().optional(),
      paymentTerms: z.string().optional().nullable(),
      currency: z.string().optional(),
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
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Supplier code already exists' } });
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        ...data,
        updatedById: req.user?.id,
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' } });
  }
});

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { products: { take: 1 } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    // Check for products
    if (existing.products.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_PRODUCTS', message: 'Cannot delete supplier with associated products. Reassign products first.' }
      });
    }

    await prisma.supplier.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Supplier deleted successfully' } });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' } });
  }
});

export default router;
