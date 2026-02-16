import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:auth');
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  company: z.string().min(1),
  phone: z.string().optional(),
  isoSpecialisms: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
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
    const partner = await prisma.mktPartner.create({
      data: {
        email,
        passwordHash,
        name,
        company,
        phone,
        isoSpecialisms: isoSpecialisms || [],
      },
    });

    // Generate referral URL
    await prisma.mktPartner.update({
      where: { id: partner.id },
      data: { referralUrl: `https://nexara.io/signup?ref=${partner.referralCode}` },
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
