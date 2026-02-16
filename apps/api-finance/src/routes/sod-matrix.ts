import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();

const createSodRuleSchema = z.object({
  role1: z.string().min(1, 'role1 is required'),
  role2: z.string().min(1, 'role2 is required'),
  conflictType: z.string().optional(),
  description: z.string().optional(),
  mitigatingControl: z.string().optional(),
  isActive: z.boolean().optional(),
});
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const data = await (prisma as any).finSodRule.findMany({ where: { orgId, deletedAt: null } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSodRuleSchema.safeParse(req.body); if (!parsed.success) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); } const orgId = (req as any).user?.orgId || 'default'; const { role1, role2, conflictType, description, mitigatingControl, isActive } = parsed.data; const data = await (prisma as any).finSodRule.create({ data: { role1, role2, conflictType, description, mitigatingControl, isActive, orgId, createdBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
export default router;
