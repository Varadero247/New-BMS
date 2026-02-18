import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:auth');
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

// Simple in-memory rate limiter for auth endpoints
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '10', 10);
const MAX_REGISTER_ATTEMPTS = parseInt(process.env.MAX_REGISTER_ATTEMPTS || '20', 10);

function checkRateLimit(key: string, maxAttempts: number): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (entry.resetAt < now) loginAttempts.delete(key);
  }
}, 30 * 60 * 1000).unref();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(72),
  name: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  phone: z.string().optional(),
  isoSpecialisms: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`register:${ip}`, MAX_REGISTER_ATTEMPTS)) {
    return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many registration attempts. Please try again later.' } });
  }
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email, password, name, company, phone, isoSpecialisms } = parsed.data;

    // Check if partner already exists
    const existing = await prisma.mktPartner.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Partner with this email already exists' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Atomic: create partner and set referral URL in one transaction
    const partner = await prisma.$transaction(async (tx) => {
      const p = await tx.mktPartner.create({
        data: {
          email,
          passwordHash,
          name,
          company,
          phone,
          isoSpecialisms: isoSpecialisms || [],
        },
      });
      return tx.mktPartner.update({
        where: { id: p.id },
        data: { referralUrl: `https://nexara.io/signup?ref=${p.referralCode}` },
      });
    });

    const token = jwt.sign(
      { id: partner.id, email: partner.email, type: 'partner' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        partner: {
          id: partner.id,
          email: partner.email,
          name: partner.name,
          company: partner.company,
          tier: partner.tier,
          referralCode: partner.referralCode,
          status: partner.status,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Partner registration failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`login:${ip}`, MAX_LOGIN_ATTEMPTS)) {
    return res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Please try again later.' } });
  }
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email, password } = parsed.data;
    const partner = await prisma.mktPartner.findUnique({ where: { email } });

    if (!partner) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    if (partner.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Partner account is suspended' },
      });
    }

    const valid = await bcrypt.compare(password, partner.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const token = jwt.sign(
      { id: partner.id, email: partner.email, type: 'partner' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        partner: {
          id: partner.id,
          email: partner.email,
          name: partner.name,
          company: partner.company,
          tier: partner.tier,
          referralCode: partner.referralCode,
          status: partner.status,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Partner login failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
});

export default router;
