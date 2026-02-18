import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('suppliers-approval');
router.post('/:id/approve', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { status: 'APPROVED', approvedDate: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Operation failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } }); } });
router.post('/:id/suspend', authenticate, async (req: Request, res: Response) => { try { const data = await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED', updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Operation failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } }); } });
export default router;
