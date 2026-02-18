import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();

const createHmrcDeadlineSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  dueDate: z.string().min(1, 'dueDate is required'),
  filingRef: z.string().optional(),
  status: z.string().optional(),
  submittedDate: z.string().datetime().optional().nullable(),
  submittedBy: z.string().optional(),
  notes: z.string().optional(),
});
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const data = await prisma.finHmrcDeadline.findMany({ where: { orgId, deletedAt: null } as any, orderBy: { dueDate: 'asc' } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createHmrcDeadlineSchema.safeParse(req.body); if (!parsed.success) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); } const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { title, description, type, dueDate, filingRef, status, submittedDate, submittedBy, notes } = parsed.data; const data = await prisma.finHmrcDeadline.create({ data: { title, description, type, dueDate, filingRef, status, submittedDate, submittedBy, notes, orgId, createdBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Internal server error' } }); } });
export default router;
