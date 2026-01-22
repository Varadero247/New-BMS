import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, requireRole, hashPassword, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users - List all users (Admin/Manager only)
router.get('/', requireRole('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, role, department } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (department) {
      where.department = department;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          department: true,
          jobTitle: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list users' },
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can view their own profile, admins/managers can view any
    if (req.user!.id !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        jobTitle: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get user' },
    });
  }
});

// POST /api/users - Create user (Admin only)
router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
      role: z.enum(['ADMIN', 'MANAGER', 'AUDITOR', 'USER']).default('USER'),
      department: z.string().optional(),
      jobTitle: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' },
      });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        ...data,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        jobTitle: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' },
    });
  }
});

// PATCH /api/users/:id - Update user
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can update their own profile, admins can update any
    const isAdmin = req.user!.role === 'ADMIN';
    const isSelf = req.user!.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const schema = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
      department: z.string().optional(),
      jobTitle: z.string().optional(),
      // Only admin can change these
      role: z.enum(['ADMIN', 'MANAGER', 'AUDITOR', 'USER']).optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Non-admins cannot change role or isActive
    if (!isAdmin) {
      delete data.role;
      delete data.isActive;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        jobTitle: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' },
    });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if (req.user!.id === id) {
      return res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_SELF', message: 'Cannot delete your own account' },
      });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete user' },
    });
  }
});

export default router;
