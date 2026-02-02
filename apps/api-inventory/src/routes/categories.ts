import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/categories - List categories (hierarchical)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { flat, isActive } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const categories = await prisma.productCategory.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    });

    // Return flat list or build hierarchy
    if (flat === 'true') {
      res.json({ success: true, data: categories });
      return;
    }

    // Build hierarchical structure
    const categoryMap = new Map(categories.map(c => [c.id, { ...c, children: [] as any[] }]));
    const rootCategories: any[] = [];

    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId)!.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    res.json({ success: true, data: rootCategories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list categories' } });
  }
});

// GET /api/categories/:id - Get single category with products
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: req.params.id },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, code: true } },
        products: {
          take: 10,
          select: { id: true, sku: true, name: true, status: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get category' } });
  }
});

// POST /api/categories - Create category
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.string().optional(),
      code: z.string().optional(),
      sortOrder: z.number().int().default(0),
    });

    const data = schema.parse(req.body);

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await prisma.productCategory.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_PARENT', message: 'Parent category not found' } });
      }
    }

    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await prisma.productCategory.findUnique({ where: { code: data.code } });
      if (existingCode) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Category code already exists' } });
      }
    }

    const category = await prisma.productCategory.create({
      data: {
        id: uuidv4(),
        ...data,
        isActive: true,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create category error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create category' } });
  }
});

// PATCH /api/categories/:id - Update category
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.productCategory.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }

    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      parentId: z.string().optional().nullable(),
      code: z.string().optional().nullable(),
      sortOrder: z.number().int().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Prevent circular reference
    if (data.parentId === req.params.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'CIRCULAR_REFERENCE', message: 'Category cannot be its own parent' }
      });
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await prisma.productCategory.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_PARENT', message: 'Parent category not found' } });
      }

      // Check if the new parent is a descendant (would create circular reference)
      const isDescendant = await checkIsDescendant(req.params.id, data.parentId);
      if (isDescendant) {
        return res.status(400).json({
          success: false,
          error: { code: 'CIRCULAR_REFERENCE', message: 'Cannot set a descendant as parent' }
        });
      }
    }

    // Check for duplicate code if changing
    if (data.code && data.code !== existing.code) {
      const existingCode = await prisma.productCategory.findUnique({ where: { code: data.code } });
      if (existingCode) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Category code already exists' } });
      }
    }

    const category = await prisma.productCategory.update({
      where: { id: req.params.id },
      data,
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update category error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update category' } });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.productCategory.findUnique({
      where: { id: req.params.id },
      include: {
        children: { take: 1 },
        products: { take: 1 },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }

    // Check for children
    if (existing.children.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_CHILDREN', message: 'Cannot delete category with subcategories. Remove subcategories first.' }
      });
    }

    // Check for products
    if (existing.products.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_PRODUCTS', message: 'Cannot delete category with products. Reassign products first.' }
      });
    }

    await prisma.productCategory.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Category deleted successfully' } });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete category' } });
  }
});

// Helper function to check if targetId is a descendant of categoryId
async function checkIsDescendant(categoryId: string, targetId: string): Promise<boolean> {
  const children = await prisma.productCategory.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    if (child.id === targetId) return true;
    const isDescendant = await checkIsDescendant(child.id, targetId);
    if (isDescendant) return true;
  }

  return false;
}

export default router;
