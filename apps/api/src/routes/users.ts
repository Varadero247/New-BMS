import { Router } from 'express';
import type { Router as IRouter } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { validate } from '../middleware/validate';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'USER']).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'USER']).optional(),
  isActive: z.boolean().optional(),
});

// Get all users (admin/manager only)
router.get('/', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search, role, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
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

    if (status) {
      where.isActive = status === 'active';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              assignedBuildings: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users.map((user) => ({
        ...user,
        buildingsCount: user._count.assignedBuildings,
        _count: undefined,
      })),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

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
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        assignedBuildings: {
          include: {
            building: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/', authenticate, requireRole(['ADMIN']), validate(createUserSchema), async (req: AuthRequest, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        newData: { email, firstName, lastName, role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.patch('/:id', authenticate, requireRole(['ADMIN']), validate(updateUserSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: updates.email },
      });

      if (emailTaken) {
        throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'User',
        entityId: user.id,
        oldData: existingUser,
        newData: updates,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.id) {
      throw new AppError(400, 'INVALID_OPERATION', 'Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'User',
        entityId: id,
        oldData: { email: user.email, firstName: user.firstName, lastName: user.lastName },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      data: { message: 'User deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// Assign user to building
router.post('/:id/buildings', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { buildingId, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    const building = await prisma.building.findUnique({ where: { id: buildingId } });
    if (!building) {
      throw new AppError(404, 'NOT_FOUND', 'Building not found');
    }

    const assignment = await prisma.buildingUser.upsert({
      where: {
        buildingId_userId: { buildingId, userId: id },
      },
      create: {
        buildingId,
        userId: id,
        role: role || 'VIEWER',
      },
      update: {
        role: role || 'VIEWER',
      },
      include: {
        building: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
