// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-incidents');
const router: Router = Router();
router.use(authenticate);

const addActionSchema = z.object({
  description: z.string().trim().min(1),
  assignedTo: z.string().trim().optional(),
  dueDate: z.string().optional(),
  actionType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMMEDIATE']).default('CORRECTIVE'),
});

const updateActionSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  completedAt: z.string().optional(),
  notes: z.string().trim().optional(),
});

// GET /api/actions/:incidentId - get actions for incident
router.get('/:incidentId', async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const incident = await prisma.incIncident.findFirst({
      where: { id: incidentId, deletedAt: null },
      select: { id: true, immediateActions: true, correctiveActions: true, preventiveActions: true },
    });
    if (!incident) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }
    const actions = [
      ...(incident.immediateActions ? [{ type: 'IMMEDIATE', description: incident.immediateActions }] : []),
      ...(incident.correctiveActions ? [{ type: 'CORRECTIVE', description: incident.correctiveActions }] : []),
      ...(incident.preventiveActions ? [{ type: 'PREVENTIVE', description: incident.preventiveActions }] : []),
    ];
    res.json({ success: true, data: actions });
  } catch (error) {
    logger.error('Error fetching actions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch actions' } });
  }
});

// POST /api/actions/:incidentId - add action to incident
router.post('/:incidentId', async (req: Request, res: Response) => {
  try {
    const parsed = addActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }
    const { incidentId } = req.params;
    const { description, actionType } = parsed.data;

    const fieldMap: Record<string, string> = {
      IMMEDIATE: 'immediateActions',
      CORRECTIVE: 'correctiveActions',
      PREVENTIVE: 'preventiveActions',
    };
    const field = fieldMap[actionType] || 'correctiveActions';

    const updated = await prisma.incIncident.update({
      where: { id: incidentId },
      data: { [field]: description, updatedBy: (req as any).user?.id } as any,
    });
    res.status(201).json({ success: true, data: { incidentId, actionType, description, incident: updated } });
  } catch (error) {
    logger.error('Error adding action', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add action' } });
  }
});

// PUT /api/actions/:incidentId/status - update action status
router.put('/:incidentId/status', async (req: Request, res: Response) => {
  try {
    const parsed = updateActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }
    const { incidentId } = req.params;
    const updated = await prisma.incIncident.update({
      where: { id: incidentId },
      data: { updatedBy: (req as any).user?.id } as any,
    });
    res.json({ success: true, data: { incidentId, ...parsed.data, incident: updated } });
  } catch (error) {
    logger.error('Error updating action status', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update action status' } });
  }
});

export default router;
