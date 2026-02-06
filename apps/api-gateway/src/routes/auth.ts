import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@ims/database';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  authenticate,
  type AuthRequest
} from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rate-limiter';
import { getAccountLockoutManager, checkAccountLockout } from '../middleware/account-lockout';

const logger = createLogger('auth-routes');
const router: IRouter = Router();
const lockoutManager = getAccountLockoutManager();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

// POST /api/auth/login
// Rate limited: 5 attempts per 15 min per IP+email
// Account lockout: 5 failed attempts = 30 min lockout
router.post('/login', authLimiter, checkAccountLockout(), async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      // Record failed attempt even if user doesn't exist (prevents enumeration)
      await lockoutManager.recordFailedAttempt(email);
      const remaining = await lockoutManager.getRemainingAttempts(email);

      logger.info('Login failed - invalid credentials', { email, ip: req.ip });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          remainingAttempts: remaining,
        },
      });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      const { locked, remainingAttempts } = await lockoutManager.recordFailedAttempt(email);

      logger.info('Login failed - wrong password', { email, ip: req.ip, locked });

      if (locked) {
        const timeRemaining = await lockoutManager.getLockoutTimeRemaining(email);
        return res.status(423).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account temporarily locked due to too many failed attempts.',
            retryAfter: timeRemaining,
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          remainingAttempts,
        },
      });
    }

    // Successful login - reset lockout counter
    await lockoutManager.reset(email);

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role, expiresIn: '15m' });
    const refreshToken = generateRefreshToken(user.id);
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session with access token
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: accessToken,
        expiresAt: accessTokenExpiresAt,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
      },
    });

    logger.info('Login successful', { userId: user.id, email: user.email, ip: req.ip });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          jobTitle: user.jobTitle,
        },
        accessToken,
        refreshToken,
        expiresAt: accessTokenExpiresAt.toISOString(),
        refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Login error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
});

// POST /api/auth/register
// Rate limited: 3 registrations per hour per IP
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      logger.info('Registration failed - user exists', { email: data.email, ip: req.ip });
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' },
      });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        jobTitle: data.jobTitle,
        role: 'USER',
        isActive: true,
      },
    });

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role, expiresIn: '15m' });
    const refreshToken = generateRefreshToken(user.id);
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: accessToken,
        expiresAt: accessTokenExpiresAt,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
      },
    });

    logger.info('Registration successful', { userId: user.id, email: user.email, ip: req.ip });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
        expiresAt: accessTokenExpiresAt.toISOString(),
        refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Registration error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      await prisma.session.deleteMany({ where: { token } });
      logger.info('Logout successful', { userId: req.user?.id });
    }

    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Logout failed' },
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        phone: user!.phone,
        avatar: user!.avatar,
        role: user!.role,
        department: user!.department,
        jobTitle: user!.jobTitle,
        createdAt: user!.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get me error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get user info' },
    });
  }
});

// POST /api/auth/refresh
// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      logger.warn('Token refresh failed - user inactive or not found', { userId: payload.userId });
      return res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'User account is inactive or not found' },
      });
    }

    // Generate new access token (15 minutes)
    const newAccessToken = generateToken({ userId: user.id, email: user.email, role: user.role, expiresIn: '15m' });
    const newRefreshToken = generateRefreshToken(user.id);
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create new session
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: newAccessToken,
        expiresAt: accessTokenExpiresAt,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || null,
      },
    });

    logger.info('Token refresh successful', { userId: user.id });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: accessTokenExpiresAt.toISOString(),
        refreshExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
      });
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      logger.warn('Token refresh failed - invalid token', { error: (error as Error).message });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }
    logger.error('Token refresh error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Token refresh failed' },
    });
  }
});

// POST /api/auth/forgot-password
// Rate limited: 3 attempts per 15 min per IP+email
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    // Always return success to prevent email enumeration
    logger.info('Password reset requested', { email, ip: req.ip });

    // TODO: Implement actual password reset email sending

    res.json({
      success: true,
      data: { message: 'If an account with that email exists, a reset link has been sent.' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' },
      });
    }
    logger.error('Forgot password error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Request failed' },
    });
  }
});

export default router;
