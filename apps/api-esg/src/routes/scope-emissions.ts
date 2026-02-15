import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { scope } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (scope) where.scope = parseInt(scope); const data = await (prisma as any).esgScopeEmission.findMany({ where, orderBy: { period: 'desc' } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const y = new Date().getFullYear(); const c = await (prisma as any).esgScopeEmission.count({ where: { orgId } }); const data = await (prisma as any).esgScopeEmission.create({ data: { ...req.body, orgId, referenceNumber: `EMI-${y}-${String(c+1).padStart(4,'0')}`, createdBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
export default router;
