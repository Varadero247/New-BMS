import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  getOrgAllowlist,
  addOrgAllowlistEntry,
  removeOrgAllowlistEntry,
} from '../middleware/ipAllowlist';

const logger = createLogger('api-gateway:ip-allowlist');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const addCidrSchema = z.object({
  cidr: z
    .string()
    .min(1, 'CIDR is required')
    .regex(
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/,
      'Must be a valid IPv4 CIDR (e.g. 192.168.1.0/24 or 10.0.0.1)'
    ),
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(100, 'Label must be 100 characters or less'),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/ip-allowlist — List allowed CIDRs for current org
router.get('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const entries = getOrgAllowlist(orgId);

    res.json({
      success: true,
      data: entries,
      meta: { total: entries.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list IP allowlist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list IP allowlist' },
    });
  }
});

// POST /api/admin/ip-allowlist — Add a CIDR entry
router.post('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = addCidrSchema.safeParse(req.body);
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
    const { cidr, label } = parsed.data;

    // Ensure CIDR has a prefix length
    const normalizedCidr = cidr.includes('/') ? cidr : `${cidr}/32`;

    const entry = {
      id: uuidv4(),
      cidr: normalizedCidr,
      label,
      createdAt: new Date().toISOString(),
    };

    addOrgAllowlistEntry(orgId, entry);

    logger.info('IP allowlist entry added', {
      orgId,
      cidr: normalizedCidr,
      label,
      addedBy: req.user!.id,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to add IP allowlist entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add IP allowlist entry' },
    });
  }
});

// DELETE /api/admin/ip-allowlist/:id — Remove an allowlist entry
router.delete('/:id', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const { id } = req.params;

    const removed = removeOrgAllowlistEntry(orgId, id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'IP allowlist entry not found' },
      });
    }

    logger.info('IP allowlist entry removed', { orgId, entryId: id, removedBy: req.user!.id });

    res.json({ success: true, data: { deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to remove IP allowlist entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to remove IP allowlist entry' },
    });
  }
});

// GET /api/admin/ip-allowlist/my-ip — Return the current client IP
router.get('/my-ip', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0';
    // Normalize IPv4-mapped IPv6
    const normalizedIp = clientIp.startsWith('::ffff:') ? clientIp.slice(7) : clientIp;

    res.json({
      success: true,
      data: {
        ip: normalizedIp,
        raw: clientIp,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get client IP', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get client IP' },
    });
  }
});

export default router;
