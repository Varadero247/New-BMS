import { Router, Request, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { z } from 'zod';
import {
  createSchedule,
  listSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  runScheduleNow,
  REPORT_TYPES,
} from '@ims/scheduled-reports';

type ReportType = string;
type ReportFormat = string;

const logger = createLogger('api-gateway:scheduled-reports');
const router = Router();
router.param('id', validateIdParam());

// All routes require authentication + admin role
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const reportTypeValues = REPORT_TYPES.map((r) => r.value) as [string, ...string[]];

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  reportType: z.enum(reportTypeValues as [ReportType, ...ReportType[]]),
  schedule: z.string().trim().min(1, 'Cron schedule is required'),
  recipients: z.array(z.string().trim().email()).min(1, 'At least one recipient is required'),
  format: z.enum(['pdf', 'excel', 'csv'] as [ReportFormat, ...ReportFormat[]]),
  enabled: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  reportType: z.enum(reportTypeValues as [ReportType, ...ReportType[]]).optional(),
  schedule: z.string().trim().min(1).max(200).optional(),
  recipients: z.array(z.string().trim().email()).min(1).optional(),
  format: z.enum(['pdf', 'excel', 'csv'] as [ReportFormat, ...ReportFormat[]]).optional(),
  enabled: z.boolean().optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/reports/types — List available report types
router.get('/types', requireRole('ADMIN'), (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: REPORT_TYPES });
  } catch (error: unknown) {
    logger.error('Failed to list report types', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list report types' },
    });
  }
});

// GET /api/admin/reports/schedules — List schedules
router.get('/schedules', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const schedules = listSchedules(orgId);

    res.json({
      success: true,
      data: schedules,
      meta: { total: schedules.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list schedules', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list schedules' },
    });
  }
});

// POST /api/admin/reports/schedules — Create schedule
router.post('/schedules', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const schedule = createSchedule({ ...parsed.data, orgId });

    logger.info('Report schedule created', {
      id: schedule.id,
      name: schedule.name,
      userId: (req as AuthRequest).user?.id,
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error: unknown) {
    logger.error('Failed to create schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create schedule' },
    });
  }
});

// GET /api/admin/reports/schedules/:id — Get schedule by ID
router.get('/schedules/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const schedule = getSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
    }

    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    logger.error('Failed to get schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get schedule' },
    });
  }
});

// PUT /api/admin/reports/schedules/:id — Update schedule
router.put('/schedules/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const schedule = updateSchedule(req.params.id, parsed.data);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
    }

    logger.info('Report schedule updated', { id: schedule.id, userId: (req as AuthRequest).user?.id });

    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    logger.error('Failed to update schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update schedule' },
    });
  }
});

// DELETE /api/admin/reports/schedules/:id — Delete schedule
router.delete('/schedules/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const deleted = deleteSchedule(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
    }

    logger.info('Report schedule deleted', { id: req.params.id, userId: (req as AuthRequest).user?.id });

    res.json({ success: true, data: { deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete schedule' },
    });
  }
});

// POST /api/admin/reports/schedules/:id/run — Trigger manual run
router.post('/schedules/:id/run', requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const schedule = runScheduleNow(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
    }

    logger.info('Report schedule manually triggered', { id: schedule.id, userId: (req as AuthRequest).user?.id });

    res.json({
      success: true,
      data: {
        ...schedule,
        message: 'Report generation triggered successfully',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to trigger schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger schedule run' },
    });
  }
});

export default router;
