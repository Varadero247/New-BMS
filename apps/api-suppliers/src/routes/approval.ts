import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.post('/:id/approve', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { status: 'APPROVED', approvedDate: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); } });
router.post('/:id/suspend', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED', updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); } });
export default router;
