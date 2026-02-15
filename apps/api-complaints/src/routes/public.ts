import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('complaints-public');
router.post('/submit', async (req: Request, res: Response) => { try { const year = new Date().getFullYear(); const count = await prisma.compComplaint.count({ where: { referenceNumber: { startsWith: `CMP-${year}` } } }); const referenceNumber = `CMP-${year}-${String(count + 1).padStart(4, '0')}`; const data = await prisma.compComplaint.create({ data: { ...req.body, orgId: req.body.orgId || 'default', referenceNumber, channel: 'WEB_FORM' } }); res.status(201).json({ success: true, data: { referenceNumber: data.referenceNumber } }); } catch (error: any) { logger.error('Public submit failed', { error: error.message }); res.status(400).json({ success: false, error: { code: 'SUBMIT_ERROR', message: error.message } }); } });
export default router;
