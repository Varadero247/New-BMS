import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.post('/:id/assign', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.incIncident.update({ where: { id: req.params.id }, data: { investigator: req.body.investigator, investigatorName: req.body.investigatorName, status: 'INVESTIGATING', updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.put('/:id/report', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.incIncident.update({ where: { id: req.params.id }, data: { rootCause: req.body.rootCause, contributingFactors: req.body.contributingFactors, correctiveActions: req.body.correctiveActions, preventiveActions: req.body.preventiveActions, investigationReport: req.body.report, investigationDate: new Date(), status: 'ROOT_CAUSE_ANALYSIS', updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
export default router;
