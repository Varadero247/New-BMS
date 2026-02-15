import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const data = await prisma.incIncident.findMany({ where: { orgId, deletedAt: null, riddorReportable: 'YES' }, orderBy: { dateOccurred: 'desc' } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
router.post('/:id/assess', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.incIncident.update({ where: { id: req.params.id }, data: { riddorReportable: req.body.reportable ? 'YES' : 'NO', riddorRef: req.body.riddorRef, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
export default router;
