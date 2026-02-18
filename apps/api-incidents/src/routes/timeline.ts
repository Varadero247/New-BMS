import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const incident = await prisma.incIncident.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!incident) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } }); const timeline = [{ date: incident.dateOccurred, event: 'Incident occurred' }, { date: incident.reportedDate, event: 'Reported' }]; if (incident.investigationDate) timeline.push({ date: incident.investigationDate, event: 'Investigation completed' }); if (incident.closedDate) timeline.push({ date: incident.closedDate, event: 'Closed' }); res.json({ success: true, data: timeline }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
