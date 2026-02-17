import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();

const createIr35Schema = z.object({
  contractorName: z.string().min(1, 'contractorName is required'),
  contractorEmail: z.string().email().optional().nullable(),
  engagementDesc: z.string().optional(),
  clientName: z.string().optional(),
  determination: z.enum(['PENDING', 'INSIDE', 'OUTSIDE', 'UNKNOWN']).optional(),
  assessmentDate: z.string().datetime().optional().nullable(),
  assessedBy: z.string().optional(),
  reasoning: z.string().optional(),
  evidenceUrl: z.string().optional(),
  reviewDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
});
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as AuthRequest).user?.orgId || 'default'; const data = await prisma.finIr35Assessment.findMany({ where: { orgId, deletedAt: null }, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createIr35Schema.safeParse(req.body); if (!parsed.success) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); } const orgId = (req as AuthRequest).user?.orgId || 'default'; const y = new Date().getFullYear(); const c = await prisma.finIr35Assessment.count({ where: { orgId } }); const { contractorName, contractorEmail, engagementDesc, clientName, determination, assessmentDate, assessedBy, reasoning, evidenceUrl, reviewDate, notes } = parsed.data; const data = await prisma.finIr35Assessment.create({ data: { contractorName, contractorEmail, engagementDesc, clientName, determination, assessmentDate, assessedBy, reasoning, evidenceUrl, reviewDate, notes, orgId, referenceNumber: `IR35-${y}-${String(c+1).padStart(4,'0')}`, createdBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); } });
export default router;
