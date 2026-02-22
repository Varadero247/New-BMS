import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');
const router: Router = Router();
router.use(authenticate);

const grievanceStore: Map<string, any> = new Map();
let counter = 0;

const createGrievanceSchema = z.object({
  employeeId: z.string().uuid(),
  subject: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1),
  category: z.enum(['WORKPLACE', 'HARASSMENT', 'DISCRIMINATION', 'COMPENSATION', 'WORKING_CONDITIONS', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

const updateGrievanceSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  resolution: z.string().trim().optional(),
  resolvedById: z.string().uuid().optional(),
});

router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    let all = Array.from(grievanceStore.values());
    if (req.query.employeeId) all = all.filter((g) => g.employeeId === req.query.employeeId);
    if (req.query.status) all = all.filter((g) => g.status === req.query.status);
    if (req.query.category) all = all.filter((g) => g.category === req.query.category);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 } });
  } catch (error) {
    logger.error('Error fetching grievances', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch grievances' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const grievance = grievanceStore.get(req.params.id);
    if (!grievance) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Grievance not found' } });
    res.json({ success: true, data: grievance });
  } catch (error) {
    logger.error('Error fetching grievance', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch grievance' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createGrievanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    counter += 1;
    const id = 'grv-' + counter;
    const grievance = { id, ...parsed.data, status: 'OPEN', createdAt: new Date().toISOString() };
    grievanceStore.set(id, grievance);
    res.status(201).json({ success: true, data: grievance });
  } catch (error) {
    logger.error('Error creating grievance', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create grievance' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateGrievanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    const existing = grievanceStore.get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Grievance not found' } });
    const updated = { ...existing, ...parsed.data, updatedAt: new Date().toISOString() };
    grievanceStore.set(req.params.id, updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Error updating grievance', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update grievance' } });
  }
});

export default router;
