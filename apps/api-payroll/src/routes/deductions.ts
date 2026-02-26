// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-payroll');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/deductions - List deductions (backed by PayslipItem DEDUCTION records)
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { employeeId, status, type } = req.query;
    const where: Record<string, unknown> = { deletedAt: null, type: 'DEDUCTION' };
    if (type) where.componentType = type;

    const items = await prisma.payslipItem.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Error fetching deductions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch deductions' } });
  }
});

// GET /api/deductions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.payslipItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deduction not found' } });
    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Error fetching deduction', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch deduction' } });
  }
});

// POST /api/deductions
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      payslipId: z.string().trim().uuid(),
      name: z.string().trim().min(1).max(200),
      amount: z.number().positive(),
      componentType: z.enum(['STATUTORY', 'VOLUNTARY', 'PENSION', 'HEALTH_INSURANCE', 'LOAN_REPAYMENT', 'OTHER']).default('OTHER'),
      description: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const item = await prisma.payslipItem.create({
      data: { ...data, type: 'DEDUCTION', quantity: 1, rate: data.amount } as any,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating deduction', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create deduction' } });
  }
});

// PUT /api/deductions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive().optional(),
      description: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const item = await prisma.payslipItem.update({ where: { id: req.params.id }, data: data as any });
    res.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating deduction', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update deduction' } });
  }
});

// DELETE /api/deductions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.payslipItem.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } as any });
    res.json({ success: true, data: { message: 'Deduction deleted' } });
  } catch (error) {
    logger.error('Error deleting deduction', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete deduction' } });
  }
});

export default router;
